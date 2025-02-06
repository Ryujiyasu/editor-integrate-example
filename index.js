"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var run_1 = require("@jxa/run");
var fs = require("fs"); // 読み込む
var path = require("path");
var os = require("os");
var child_process_1 = require("child_process");
var sync_1 = require("csv-parse/sync");
function getUsername(site_type, location_word, search_word, search_type, site_id, location) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileContent, latitude, longitude;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = path.join(os.homedir(), 'Desktop', 'gpxgenerator_path.gpx');
                    if (!fs.existsSync(filePath)) {
                        console.error("Error: \u30D5\u30A1\u30A4\u30EB\u304C\u5B58\u5728\u3057\u307E\u305B\u3093 -> ".concat(filePath));
                        process.exit(1); // エラー終了
                    }
                    fileContent = fs.readFileSync(filePath, 'utf-8');
                    latitude = location.split(':')[0];
                    longitude = location.split(':')[1];
                    console.log(fileContent);
                    // <?xml version="1.0"?>
                    // <gpx version="1.1" creator="gpxgenerator.com">
                    // <wpt lat="34.57036336288414" lon="135.49725383201599">
                    //     <ele>20.11</ele>
                    //     <time>2025-01-26T04:03:55Z</time>
                    // </wpt>
                    // </gpx>
                    fs.writeFileSync(filePath, "<?xml version=\"1.0\"?>\n    <gpx version=\"1.1\" creator=\"gpxgenerator.com\">\n        <wpt lat=\"".concat(latitude, "\" lon=\"").concat(longitude, "\">\n            <ele>20.11</ele>\n            <time>2025-01-27T04:03:55Z</time>\n        </wpt>\n    </gpx>"), 'utf-8');
                    (0, child_process_1.exec)('adb shell cmd connectivity airplane-mode enable', function (error, stdout, stderr) {
                        if (error) {
                            console.error("Error: ".concat(error.message));
                            return;
                        }
                        if (stderr) {
                            console.error("Stderr: ".concat(stderr));
                            return;
                        }
                        console.log("Devices:\n".concat(stdout));
                        setTimeout(function () {
                            (0, child_process_1.exec)('adb shell cmd connectivity airplane-mode disable', function (error, stdout, stderr) {
                                if (error) {
                                    console.error("Error: ".concat(error.message));
                                    return;
                                }
                                if (stderr) {
                                    console.error("Stderr: ".concat(stderr));
                                    return;
                                }
                                console.log("Devices:\n".concat(stdout));
                            });
                        }, 1000);
                    });
                    return [4 /*yield*/, (0, run_1.run)(function (site_type, location_word, search_word, search_type, site_id, location) {
                            var clickAllowButton = function (safariProc) {
                                var frontWin = safariProc.windows[0];
                                // シート(AXSheet)のボタン一覧から「許可」を探す
                                if (frontWin.sheets().length > 0) {
                                    console.log("シートが表示されています。");
                                    var sheet = frontWin.sheets()[0]; // 先頭シート
                                    console.log("シートのボタン数: " + sheet.buttons().length);
                                    // シートのボタンを列挙してみる
                                    //  ボタンのタイトルが「許可」になっているかどうかをチェック
                                    sheet.buttons().forEach(function (btn) {
                                        console.log("ボタン: " + btn.name());
                                    });
                                    var allowButton = sheet.buttons().find(function (btn) { return btn.name() === "許可"; });
                                    if (allowButton) {
                                        allowButton.click();
                                        return "Clicked '許可' on the sheet.";
                                    }
                                    else {
                                        console.log("許可ボタンが見つかりませんでした。");
                                        return "No allow button.";
                                    }
                                }
                                return "fin clickAllowButton";
                            };
                            var searchUrlClick = function (safari) {
                                safari.doJavaScript("\n                let elements = document.querySelectorAll(\".MjjYud\");\n                console.log(\"elements: \" + elements.length);\n                let finish = false;\n                for (let i = 0; i < elements.length; i++) {\n                    let a = elements[i].querySelectorAll(\"a\");\n                    console.log(\"a: \" + a);\n                    for (let j = 0; j < a.length; j++) {\n                        if (a[j].href == null) {\n                            continue;\n                        }\n                        console.log(\"a[j].href: \" + a[j].href);\n                        let url = a[j].href.toString();\n\n                        console.log(\"url: \" + url);\n\n                        if(url.includes(\"youtube\") || url.includes(\"twitter\") || url.includes(\"instagram\") || url.includes(\"facebook\")) {\n                            continue;\n                        }\n                        if(url.includes(\"google\") || url.includes(\"apple\")) {\n                            continue;\n                        }\n                            \n                        a[j].click();\n                        finish = true;\n                        break;  \n                    }\n                    if (finish) {\n                        break;\n                    }\n                }\n            ", { in: safari.windows[0].currentTab() });
                                globalThis.delay(2);
                                safari.doJavaScript("\n                window.scrollBy({\n                    top: 1000,  \n                    behavior: \"smooth\"\n                });\n            ", { in: safari.windows[0].currentTab() });
                                globalThis.delay(2);
                                safari.doJavaScript("\n                window.scrollBy({\n                    top: -1000,  \n                    behavior: \"smooth\"\n                });\n            ", { in: safari.windows[0].currentTab() });
                                globalThis.delay(2);
                                safari.doJavaScript("\n                history.back();\n            ", { in: safari.windows[0].currentTab() });
                                globalThis.delay(2);
                            };
                            var safariSearch = function () {
                                var search_sites = [
                                    "https://www.google.co.jp",
                                    "https://www.google.com",
                                ];
                                var safari = globalThis.Application("Safari");
                                safari.activate();
                                globalThis.delay(0.5);
                                // 2. System Events 経由で Safari のプロセスを取得
                                var systemEvents = globalThis.Application("System Events");
                                var safariProc = systemEvents.processes.byName("Safari");
                                // 3. 「ファイル」メニューをクリックして開く
                                safariProc.menuBars[0].menuBarItems.byName("ファイル").click();
                                globalThis.delay(0.5); // 少し待たないとメニューが開ききる前に要素取得が走ってしまう
                                // 4. 「ファイル」メニューのサブメニュー項目を全て取得
                                var fileMenu = safariProc.menuBars[0].menuBarItems.byName("ファイル").menus[0];
                                var menuItems = fileMenu.menuItems();
                                // 5. コンソールログに各メニュー項目の名前を出力
                                console.log("=== 'ファイル' メニューの項目一覧 ===");
                                menuItems.at(0).click();
                                var subMenu = menuItems.at(0).menus[0].menuItems();
                                //random 1 ~100
                                var random = Math.floor(Math.random() * 100);
                                console.log("random: " + random);
                                subMenu.at(random).click();
                                globalThis.delay(0.5);
                                safari.documents[0].url = "https://yasu-home.com?random=true";
                                globalThis.delay(2);
                                if (site_type == 1) {
                                    safari.documents[0].url = search_sites[0];
                                }
                                else {
                                    safari.documents[0].url = search_sites[1];
                                }
                                console.log("=== 完了 ===");
                                var tab = safari.windows[0].currentTab();
                                globalThis.delay(3);
                                console.log("天気を検索");
                                safari.doJavaScript("\n            document.querySelector(\"textarea.gLFyf\").value = \"\u5929\u6C17\";\n            document.querySelector(\"textarea.gLFyf\").form.submit();\n            ", { in: tab });
                                globalThis.delay(5);
                                console.log("clickAllowButton");
                                clickAllowButton(safariProc);
                                // 正確な現在地を使用をクリック
                                safari.doJavaScript("\n            document.querySelector(\"span.HzHK1\").click();\n            ", { in: tab });
                                globalThis.delay(10);
                                //許可が出ればおす
                                clickAllowButton(safariProc);
                                safari.doJavaScript("\n            document.querySelector(\"div.VtPCGb\").click();\n            ", { in: tab });
                                globalThis.delay(10);
                                safari.doJavaScript("\n            document.querySelector(\"a[id='logo']\").click();\n            ", { in: tab });
                                globalThis.delay(2);
                                safari.doJavaScript("\n            document.querySelector(\"textarea.gLFyf\").value = \"\u7F8E\u5473\u3057\u3044\u3000\u3068\u3046\u3082\u308D\u3053\u3057\";\n            document.querySelector(\"textarea.gLFyf\").form.submit();\n            ", { in: tab });
                                globalThis.delay(2);
                                safari.doJavaScript("\n            document.querySelector(\"a[class='zReHs']\")[0].click();\n            ", { in: tab });
                                searchUrlClick(safari);
                                // safari 閉じる
                                safari.quit();
                            };
                            var locationChange = function () {
                                // 1. Xcode をアクティブにする
                                for (var i = 0; i < 2; i++) {
                                    var xcode = globalThis.Application("Xcode");
                                    xcode.activate();
                                    globalThis.delay(0.5);
                                    var systemEvents = globalThis.Application("System Events");
                                    var xcodeProc = systemEvents.processes.byName("Xcode");
                                    // 3. 「ファイル」メニューをクリックして開く
                                    xcodeProc.menuBars[0].menuBarItems.byName("Debug").click();
                                    globalThis.delay(1); // 少し待たないとメニューが開ききる前に要素取得が走ってしまう
                                    // 4. 「ファイル」メニューのサブメニュー項目を全て取得
                                    var fileMenu = xcodeProc.menuBars[0].menuBarItems.byName("Debug").menus[0];
                                    var menuItems = fileMenu.menuItems();
                                    // 5. コンソールログに各メニュー項目の名前を出力
                                    console.log("=== 'ファイル' メニューの項目一覧 ===");
                                    menuItems.forEach(function (item, index) {
                                        console.log("item: " + item.name());
                                        console.log("index: " + index);
                                    });
                                    menuItems.at(22).click();
                                    var subMenu = menuItems.at(22).menus[0].menuItems();
                                    subMenu.forEach(function (item, index) {
                                        console.log("item: " + item.name());
                                        console.log("index: " + index);
                                    });
                                    if (i == 0) {
                                        subMenu.at(0).click();
                                    }
                                    else {
                                        subMenu.at(2).click();
                                    }
                                }
                            };
                            locationChange();
                            safariSearch();
                            return "Done!";
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var data = fs.readFileSync('search.csv', { encoding: 'utf8' });
// header: true
var records = (0, sync_1.parse)(data, {
    columns: false,
    skip_empty_lines: true
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, records_1, record, site_type, location_word, search_word, search_type, site_id, location_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, records_1 = records;
                _a.label = 1;
            case 1:
                if (!(_i < records_1.length)) return [3 /*break*/, 4];
                record = records_1[_i];
                site_type = record[0], location_word = record[1], search_word = record[2], search_type = record[3], site_id = record[4], location_1 = record[5];
                if (site_type === 'site_type') {
                    return [3 /*break*/, 3];
                }
                return [4 /*yield*/, getUsername(Number(site_type), location_word, search_word, search_type, site_id, location_1).then(console.log)];
            case 2:
                _a.sent();
                console.log("Finished: ".concat(search_word, " at ").concat(location_1));
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); })();
