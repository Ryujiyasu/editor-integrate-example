import { run } from "@jxa/run";
import * as fs from 'fs' // 読み込む
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { parse } from 'csv-parse/sync';
import { config } from './config';

// ログファイルのパスを設定
const logFilePath = path.join('./logs/output.log');

// ログディレクトリを作成（存在しない場合）
const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// ログ書き込み関数
function log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // ファイルに追記
    fs.appendFileSync(logFilePath, logMessage, 'utf8');

    // 必要ならコンソールにも出力
    console.log(logMessage);
}


async function getUsername(
    site_type: number,
    location_word: string,
    search_word: string,
    search_type: string,
    site_id: string,
    location: string,
    userAgent: string,
    change_random_ua: boolean
) {

    log(`userAgent: ${userAgent}`);
    // fileを書き換える
    // ~/Desktop/gpxgenerator_path.gpx
    const filePath = path.join(os.homedir(), 'Desktop', 'gpxgenerator_path.gpx');
    if (!fs.existsSync(filePath)) {
        log(`Error: ファイルが存在しません -> ${filePath}`);
        process.exit(1); // エラー終了
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const latitude = location.split(':')[0]; 
    const longitude = location.split(':')[1];
    log(fileContent);
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
            log(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            log(`Stderr: ${stderr}`);
            return;
        }
        log(`Devices:\n${stdout}`);
        setTimeout(() => {
            exec('adb shell cmd connectivity airplane-mode disable', (error, stdout, stderr) => {
                if (error) {
                    log(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    log(`Stderr: ${stderr}`);
                    return;
                }
                log(`Devices:\n${stdout}`);
            });
        }, 1000);
    });
    

    

    log(`site_type: ${site_type}`);
    log(`location_word: ${location_word}`);
    log(`search_word: ${search_word}`);
    log(`search_type: ${search_type}`);
    log(`site_id: ${site_id}`);
    log(`location: ${location}`);
    try{
        const result = await run((
            site_type: number,
            location_word: string,
            search_word: string,
            search_type: string,
            site_id: string,
            location: string,
            userAgent: string,
            change_random_ua: boolean
    
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
                            console.log("a.length: " + a.length);
                            for (let j = 0; j < a.length; j++) {
                                console.log("a[j].href: " + a[j].href);
                                console.log("a[j]");
                                if (a[j].href == null || a[j].href == "") {
                                    continue;
                                }
                                console.log("a[j].href: " + a[j].href);
                                let url = a[j].href.toString();
        
                                console.log("url: " + url);
        
                                if(url.includes("youtube") || url.includes("twitter") || url.includes("instagram") || url.includes("facebook")) {
                                    continue;
                                }
                                if(url.includes("apple")) {
                                    continue;
                                }
                                counter++;
                                console.log("counter: " + counter);
                                console.log("search_type_num: " + ${search_type_num});
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
                }else{
                    const search_check_word = search_type;
                    console.log("search_check_word: " + search_check_word);
                    safari.doJavaScript(`
                        let a = document.querySelectorAll("a");
                        for (let j = 0; j < a.length; j++) {
                            if (a[j].href == null) {
                                continue;
                            }
                            console.log(a[j].textContent);
                            if(a[j].textContent.includes("${search_check_word}") == false) {
                                continue;
                            }
                            a[j].click();
                            break;                        
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
                let tab = safari.windows[0].currentTab();
                // id="ip" の要素を取得して、その値をコンソールログに出力
                globalThis.delay(2);
                const app = globalThis.Application.currentApplication();
                app.includeStandardAdditions = true;
    
                // shell経由で ifconfig.me のサービスを叩いてIPを取得する
                const ip = app.doShellScript("curl -s https://ifconfig.me");
                globalThis.delay(2);
                console.log("IP: " + ip);

    
                // UA設定
                if(change_random_ua){
                    safariProc.menuBars[0].menuBarItems.byName("開発").click();
                    globalThis.delay(0.5); // 少し待たないとメニューが開ききる前に要素取得が走ってしまう
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
                    systemEvents.keyCode(51);
                    // input
    
                    globalThis.delay(2);
                    // copy clipboard userAgent
    
                    // AppKitフレームワークをインポート
                    systemEvents.includeStandardAdditions = true;
                    systemEvents.setTheClipboardTo(userAgent);
                    globalThis.delay(2);
    
                    systemEvents.keystroke("v", { using: "command down" });
                    
                    // enter
                    systemEvents.keyCode(76);
                    globalThis.delay(2);
                }
                console.log("=== 完了 ===");
                tab = safari.windows[0].currentTab();
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
    
                    safari.doJavaScript(`
                    document.querySelector("input[name='q']").value = "${location_word}";
                    document.querySelector("input[name='q']").form.submit();
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
                if(document.querySelector("textarea.gLFyf") == null) {
                    window.location.href = "${search_sites[site_type - 1]}";
                }
                `, {in: tab});
    
                globalThis.delay(2);
                
                safari.doJavaScript(`
                document.querySelector("textarea.gLFyf").value = "${search_word}";
                document.querySelector("textarea.gLFyf").form.submit();
                `, {in: tab});
    
                safari.doJavaScript(`
                document.querySelector("input[name='q']").value = "${search_word}";
                document.querySelector("input[name='q']").form.submit();
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
    
                    menuItems.at(22).click();
    
                    const subMenu = menuItems.at(22).menus[0].menuItems();
    
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
    
        }, site_type, location_word, search_word, search_type, site_id, location, userAgent, change_random_ua);
        log(`JXA 実行結果: ${result}`);
    }catch(e){
        log(e);
    }
    log(`Finished: ${search_word} at ${location}`);
    

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
        let userAgent = "";
        if(config.change_random_ua){
            const userAgentData = fs.readFileSync('userAgent.config', { encoding : 'utf8' });
            const userAgentList = userAgentData.split('\n');
            const random = Math.floor(Math.random() * userAgentList.length);
            userAgent = userAgentList[random];

        }
        console.log("userAgent: " + userAgent);
        console.log(`change_random_ua: ${config.change_random_ua}`);
        await getUsername(
            Number(site_type),
            location_word,
            search_word,
            search_type,
            site_id,
            location,
            userAgent,
            config.change_random_ua
        ).then(console.log);

        console.log(`Finished: ${search_word} at ${location}`);

    }
})();




