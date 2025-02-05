print('機内モード開始')
import android_auto_play_opencv as am
print('機内モード開始')
import subprocess  # 文字/cmd入力
print('機内モード開始')
adbpath = '/Users/yasukouchiryuuji/Library/Android/sdk/platform-tools'

print('機内モード開始')
aapo = am.AapoManager(adbpath)
print('機内モード開始')
aapo.sleep(3)
enablecmd = f"adb shell cmd connectivity airplane-mode enable"
subprocess.run(enablecmd, shell=True)
aapo.sleep(5)
disablecmd = f"adb shell cmd connectivity airplane-mode disable"
subprocess.run(disablecmd, shell=True)
aapo.sleep(10)

statuscmd = f"adb shell cmd connectivity airplane-mode"
status = subprocess.run(statuscmd, stdout = subprocess.PIPE, stderr = subprocess.PIPE)
status1 = status.stdout.decode("utf8")
status1 = status1.strip()
print(status1)

if status1 == "disabled":
    print(f"パスします")
    print('機内モード完了')
    pass
else:
    print(f"リトライ")
    disablecmd = f"adb shell cmd connectivity airplane-mode disable"
    subprocess.run(disablecmd, shell=True)
    aapo.sleep(10)
    print('機内モード完了')
