import { run } from "@jxa/run";
import * as fs from 'fs' // 読み込む
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { parse } from 'csv-parse/sync';
import { config } from './config';



async function getUsername(
    site_type: number,
    location_word: string,
    search_word: string,
    search_type: string,
    site_id: string,
    location: string
) {


    // fileを書き換える
    // ~/Desktop/gpxgenerator_path.gpx
    const filePath = path.join(os.homedir(), 'Desktop', 'gpxgenerator_path.gpx');
    if (!fs.existsSync(filePath)) {
        console.error(`Error: ファイルが存在しません -> ${filePath}`);
        process.exit(1); // エラー終了
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const latitude = location.split(':')[0]; 
    const longitude = location.split(':')[1];
    console.log(fileContent);
    // <?xml version="1.0"?>
    // <gpx version="1.1" creator="gpxgenerator.com">
    // <wpt lat="34.57036336288414" lon="135.49725383201599">
    //     <ele>20.11</ele>
    //     <time>2025-01-26T04:03:55Z</time>
    // </wpt>
    // </gpx>

    fs.writeFileSync(filePath, 
    `<?xml version="1.0"?>
    <gpx version="1.1" creator="gpxgenerator.com">
        <wpt lat="${latitude}" lon="${longitude}">
            <ele>20.11</ele>
            <time>2025-01-27T04:03:55Z</time>
        </wpt>
    </gpx>`, 'utf-8');

    exec('adb shell cmd connectivity airplane-mode enable', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Devices:\n${stdout}`);
        setTimeout(() => {
            exec('adb shell cmd connectivity airplane-mode disable', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    return;
                }
                console.log(`Devices:\n${stdout}`);
            });
        }, 1000);
    });
    

    

    console.log(`site_type: ${site_type}`);
    console.log(`location_word: ${location_word}`);
    console.log(`search_word: ${search_word}`);
    console.log(`search_type: ${search_type}`);
    console.log(`site_id: ${site_id}`);
    console.log(`location: ${location}`);
    return await run((
        site_type: number,
        location_word: string,
        search_word: string,
        search_type: string,
        site_id: string,
        location: string

    ) => {

        const clickAllowButton = (safariProc) => {
            let frontWin = safariProc.windows[0];

            // シート(AXSheet)のボタン一覧から「許可」を探す
            if (frontWin.sheets().length > 0) {
                console.log("シートが表示されています。");
                const sheet = frontWin.sheets()[0];  // 先頭シート
                
                console.log("シートのボタン数: " + sheet.buttons().length);
                // シートのボタンを列挙してみる
                //  ボタンのタイトルが「許可」になっているかどうかをチェック
                sheet.buttons().forEach(btn => {
                console.log("ボタン: " + btn.name());
                });

                const allowButton = sheet.buttons().find(btn => btn.name() === "許可");
                
                
                if (allowButton) {
                    allowButton.click();
                    return "Clicked '許可' on the sheet.";
                } else {
                    console.log("許可ボタンが見つかりませんでした。");
                    return "No allow button.";
                }
            }
        
            return "fin clickAllowButton";
        }

        const searchUrlClick = (safari) => {
            console.log("search_type: " + search_type);

            // random の場合
            if (search_type.startsWith("random")) {
               search_type = search_type.replace("random", "");
               console.log("search_type: " + search_type);
               let search_type_num = Number(search_type);
               if (search_type_num == 0) {
                   // 1 ~ 10
                     search_type_num = Math.floor(Math.random() * 10) + 1;
               }
                console.log("search_type_num: " + search_type_num);
                safari.doJavaScript(`
                    let elements = document.querySelectorAll(".MjjYud");
                    console.log("elements: " + elements.length);
                    let finish = false;
                    let counter = 0;
                    for (let i = 0; i < elements.length; i++) {
                        let a = elements[i].querySelectorAll("a");
                        console.log("a: " + a);
                        for (let j = 0; j < a.length; j++) {
                            if (a[j].href == null) {
                                continue;
                            }
                            console.log("a[j].href: " + a[j].href);
                            let url = a[j].href.toString();
    
                            console.log("url: " + url);
    
                            if(url.includes("youtube") || url.includes("twitter") || url.includes("instagram") || url.includes("facebook")) {
                                continue;
                            }
                            if(url.includes("google") || url.includes("apple")) {
                                continue;
                            }
                            counter++;
                            if(counter == ${search_type_num}) {
                                a[j].click();
                                finish = true;
                                break;
                            }
  
                        }
                        if (finish) {
                            break;
                        }
                    }
                `, {in: safari.windows[0].currentTab()});
            }
            
            globalThis.delay(2);
            safari.doJavaScript(`
                window.scrollBy({
                    top: 1000,  
                    behavior: "smooth"
                });
            `, {in: safari.windows[0].currentTab()});
            globalThis.delay(2);
            safari.doJavaScript(`
                window.scrollBy({
                    top: -1000,  
                    behavior: "smooth"
                });
            `, {in: safari.windows[0].currentTab()});
            globalThis.delay(2);
            safari.doJavaScript(`
                history.back();
            `, {in: safari.windows[0].currentTab()});

            globalThis.delay(2);                
        }
        const safariSearch = () => {
            const search_sites = [
                "https://www.google.co.jp",
                "https://www.google.com",
            ];
            const safari = globalThis.Application("Safari");
            safari.activate();
            globalThis.delay(0.5);

            // 2. System Events 経由で Safari のプロセスを取得
            const systemEvents = globalThis.Application("System Events");
            const safariProc   = systemEvents.processes.byName("Safari");

            // 3. 「ファイル」メニューをクリックして開く
            safariProc.menuBars[0].menuBarItems.byName("ファイル").click();
            globalThis.delay(0.5); // 少し待たないとメニューが開ききる前に要素取得が走ってしまう

            // 4. 「ファイル」メニューのサブメニュー項目を全て取得
            let fileMenu = safariProc.menuBars[0].menuBarItems.byName("ファイル").menus[0];
            let menuItems = fileMenu.menuItems();

            // 5. コンソールログに各メニュー項目の名前を出力
            console.log("=== 'ファイル' メニューの項目一覧 ===");

            menuItems.at(0).click();

            const subMenu = menuItems.at(0).menus[0].menuItems();


            //random 1 ~100
            let random = Math.floor(Math.random() * 100);
            console.log("random: " + random);
            
            subMenu.at(random).click();
            globalThis.delay(0.5);

            safari.documents[0].url = "https://yasu-home.com?random=true";




            safariProc.menuBars[0].menuBarItems.byName("開発").click();
            globalThis.delay(0.5); // 少し待たないとメニューが開ききる前に要素取得が走ってしまう

            // 4. 「ファイル」メニューのサブメニュー項目を全て取得
            let kaihatsuMenu = safariProc.menuBars[0].menuBarItems.byName("開発").menus[0];
            let kaihatsuMenuItems = kaihatsuMenu.menuItems();

            // 5. コンソールログに各メニュー項目の名前を出力
            console.log("=== 'ユーザーエージェント ===");

            kaihatsuMenuItems.at(1).click();
            const kaihatsuSubMenu = kaihatsuMenuItems.at(1).menus[0].menuItems();
     
            kaihatsuSubMenu.at(17).click();

            globalThis.delay(2);
            
            // keyboard 全選択
            systemEvents.keystroke("a", { using: "command down" });
            // delete
            systemEvents.keystroke("\u0008");
            // input
            systemEvents.keystroke("Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 YJApp-IOS jp.co.yahoo.ipn.appli/4.49.0");
            // enter
            systemEvents.keyCode(76);
            globalThis.delay(2);

            console.log("=== 完了 ===");
            let tab = safari.windows[0].currentTab();
            globalThis.delay(3);

            if (location_word != "") {
                console.log("site_type: " + site_type);

                if(site_type == 1) {
                    safari.documents[0].url = search_sites[0];
                }else {
                    safari.documents[0].url = search_sites[1];
                }

                console.log("天気を検索");
                console.log("location_word: " + location_word);
                globalThis.delay(2);
                safari.doJavaScript(`
                document.querySelector("textarea.gLFyf").value = "${location_word}";
                document.querySelector("textarea.gLFyf").form.submit();
                `, {in: tab});

                globalThis.delay(5);

                
                console.log("clickAllowButton");
                clickAllowButton(safariProc);
                

                // 正確な現在地を使用をクリック
                safari.doJavaScript(`
                document.querySelector("span.HzHK1").click();
                `, {in: tab});

                globalThis.delay(10);

                //許可が出ればおす
                clickAllowButton(safariProc);
                

                safari.doJavaScript(`
                document.querySelector("div.VtPCGb").click();
                `, {in: tab});

                globalThis.delay(2);

                //許可が出ればおす
                clickAllowButton(safariProc);

                globalThis.delay(2);

                if(site_id == "J1"){
                    if(site_type == 1) {
                        safari.documents[0].url = search_sites[0];
                    }else{
                        safari.documents[0].url = search_sites[1];
                    }
    
                    globalThis.delay(2);

                }

            }else{
                if(site_id == "J1"){
                    if(site_type == 1) {
                        safari.documents[0].url = search_sites[0];
                    }else{
                        safari.documents[0].url = search_sites[1];
                    }
    
                    globalThis.delay(2);

                }
                globalThis.delay(2);
            }



            safari.doJavaScript(`
            document.querySelector("textarea.gLFyf").value = "${search_word}";
            document.querySelector("textarea.gLFyf").form.submit();
            `, {in: tab});



            globalThis.delay(2);


            
            safari.doJavaScript(`
            document.querySelector("a[class='zReHs']")[0].click();
            `, {in: tab});

            searchUrlClick(safari);

            // safari 閉じる
            safari.quit();
        }
        const locationChange = () => {

            // 1. Xcode をアクティブにする
            for(let i = 0; i < 2; i++) {
                const xcode = globalThis.Application("Xcode");
                xcode.activate();
                globalThis.delay(0.5);

                const systemEvents = globalThis.Application("System Events");
                const xcodeProc   = systemEvents.processes.byName("Xcode");
                // 3. 「ファイル」メニューをクリックして開く
                xcodeProc.menuBars[0].menuBarItems.byName("Debug").click();
                globalThis.delay(1); // 少し待たないとメニューが開ききる前に要素取得が走ってしまう

                // 4. 「ファイル」メニューのサブメニュー項目を全て取得
                let fileMenu = xcodeProc.menuBars[0].menuBarItems.byName("Debug").menus[0];
                let menuItems = fileMenu.menuItems();

                // 5. コンソールログに各メニュー項目の名前を出力
                console.log("=== 'ファイル' メニューの項目一覧 ===");

                menuItems.forEach((item, index) => {
                    console.log("item: " + item.name());
                    console.log("index: " + index);
                });
                menuItems.at(22).click();

                const subMenu = menuItems.at(22).menus[0].menuItems();

                subMenu.forEach((item, index) => {
                    console.log("item: " + item.name());
                    console.log("index: " + index);
                });
                if(i == 0) {
                    subMenu.at(0).click();
                }else{
                    subMenu.at(2).click();
                }
            }
            
        }
        
        locationChange();
        safariSearch();
        

        return "Done!";

    }, site_type, location_word, search_word, search_type, site_id, location);
}

const data = fs.readFileSync('search.csv', { encoding : 'utf8' });
// header: true
const records = parse(data, {
    columns: false,
    skip_empty_lines: true
});
(async () => {
    for (const record of records) {
        const [site_type, location_word, search_word, search_type, site_id, location] = record;
        if (site_type === 'site_type') {
            continue;
        }

        await getUsername(
            Number(site_type),
            location_word,
            search_word,
            search_type,
            site_id,
            location
        ).then(console.log);

        console.log(`Finished: ${search_word} at ${location}`);

    }
})();




