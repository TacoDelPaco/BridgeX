[![logo][]](https://xyo.network)

# BridgeX Modified

I created this repository as a reference for anyone wanting to setup a BridgeX on a Raspberry Pi Zero 1.1/2 W, but theoretically it should work on just about anything.

It basically is an upgrade to using [@abandonware/bleno](https://github.com/abandonware/bleno), [@abandonware/noble](https://github.com/abandonware/noble) and [@abandonware/bluetooth-hci-socket](https://github.com/abandonware/bluetooth-hci-socket) which allows NodeJS 12+ (I'm using 20.5.1 with [NVM](https://github.com/nvm-sh/nvm)) to be used inconjunction with the latest Raspbian OS.

I will try to document my process and guide through the installation, feel free to message me if you have any questions. I will also make quality of life changes throughout the codebase, as there is a lot of unneccesary or unused portions.

### Raspberry Pi Zero 1.1 W and original img

If you're wanting to use the original **bridgex.img** with the Pi0W, you can simply run `sudo npm rebuild --unsafe-perm --build-from-source` in `/usr/lib/node_modules/` to get it running and you don't need this repo.

## Installation

> **Note:** I've tested this with Raspbian OS 11 on a Raspberry Pi Zero 1.1 W & Pi Zero 2 W & Pi 3b+, Raspbian OS 10 on a Raspberry Pi Zero 1.1 W & Pi 3b+

1. Clone the repository in home directory
   `git clone https://github.com/TacoDelPaco/BridgeX`
2. Run `npm rebuild --unsafe-perm --build-from-source` in the root of the project directory
3. Run `npm start` or `node node_modules/@xyo-network/bridge.pi/bin/start.js`

Everything should be running, although you may want to put it in a `screen` or `tmux` to be able to run in the background. The web side of things also doesn't work, as it requires more steps which I include in the next section.

## Configuration

> **Note:** Be sure and edit `<RPi Username>` in each file to whatever you set the Raspbian OS username to when setting it up/formatting

After installing, the following steps continue setting up the BridgeX to automatically start and run the webserver but is not required.

1. Create a file `sudoedit /etc/xdg/lxsession/LXDE-pi/autostart` and paste the following:

```
#@lxpanel --profile LXDE-pi
#@pcmanfm --desktop --profile LXDE-pi
#@xscreensaver -no-splash
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --noerrdialogs --disable-infobars --kiosk --app=file:///home/<RPi USERNAME>/BridgeX/bridge-client/loader.html
```

2. Create a symbolic link `sudo ln -s /home/<RPi Username>/BridgeX/node_modules/@xyo-network/bridge.pi/bin/start.js /usr/bin/xyo-pi-bridge`
3. Create a file `sudoedit /usr/local/bin/xyo-bridge-start.sh` and paste the following:

```
#!/bin/bash

sudo PORT=80 STORE=/home/<RPi Username>/BridgeX/bridge-store STATIC=/home/<RPi Username>/BridgeX/bridge-client /usr/bin/node /usr/bin/xyo-pi-bridge
```

4. Set executable permissions on previous file `sudo chmod +x /usr/local/bin/xyo-bridge-start.sh`
5. Create a file `sudoedit /etc/systemd/system/xyo-bridge.service` and paste the following:

```
[Unit]
Description=XYO Bridge Service
After=network.target

[Service]
User=root
Type=simple
ExecStart=/usr/local/bin/xyo-bridge-start.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

5. Run `sudo systemctl enable xyo-bridge && sudo systemctl start xyo-bridge`

You should now have a fully automated BridgeX running on an updated NodeJS, OS, Pi02W, etc. 🎉

Depending on your Pi's `hostname` you should be able to visit it via http://raspberrypi.lan (might require [Bonjour](https://support.apple.com/kb/dl999?locale=en_US)) or http://raspberrypi.local with the default password `geohacker`

## Wireless power managment

If you notice your Pi's wireless timing out/disconnecting after some time, you may need to disable wireless power managment.

Run `sudoedit /etc/rc.local` and add before `exit 0`:

```
/sbin/iwconfig wlan0 power off
```

## Bluetooth issues

> **Note:** Try these at your own risk, I have mostly everything running on all of my Pi's and it seems fine but your mileage may vary

I've been experimenting with options to help with Bluetooth errors, here are a few things that may or may not help (in no particular order):

- Run `sudoedit /usr/local/bin/xyo-bridge-start.sh` and add `NOBLE_MULTI_ROLE=1` after `sudo`
- Run `sudoedit /boot/config.txt` and make sure `otg_mode=1`
- Run `sudoedit /boot/cmdline.txt` and add `dwc_otg.microframe_schedule=1 dwc_otg.speed=1` before the `rootwait` parameter

> **Note:** I've had the most problems with this one, when it works it works but I can't figure out why it breaks either 🤔

- Run `sudo systemctl stop bluetooth && sudo hciconfig hci0 up` as noted in the [Bleno](https://github.com/abandonware/bleno?tab=readme-ov-file#linux) README

## NVM / sudo / sudoless

> **Note:** Be sure and edit `<RPi Username>` in each file to whatever you set the Raspbian OS username to when setting it up/formatting

Running `nvm`, you'll need to update where `node` is referenced and also `sudo` won't work, so you'll need to either allow `sudo` or configure your Pi to allow access with `node`

### Running with nvm

You'll need to edit wherever `node` is linked and replace it with a static link to the NVM version you're using.

1. Run `sudoedit /usr/bin/xyo-pi-bridge` and change the first line:

```
#!/home/<RPi Username>/.nvm/versions/node/<Node Version>/bin/node

const { main } = require('../dist/index.js');

main()
```

2. Run `sudoedit /usr/local/bin/xyo-bridge-start.sh` and change where `node` is referenced:

```
#!/bin/bash

sudo PORT=80 STORE=/home/<RPi USERNAME>/BridgeX/bridge-store STATIC=/home/<RPi USERNAME>/BridgeX/bridge-client /home/<RPi Username>/.nvm/versions/node/<Node Version>/bin/node /usr/bin/xyo-pi-bridge
```

### Running with sudo

Run `nano ~/.nvm/nvm.sh` and paste the following at the end of the file:

```
alias node='$NVM_BIN/node'
# possibly adding an alias for npm as well?
# alias node='$NVM_BIN/npm'
alias sudo='sudo '
```

### Running without sudo

> **Note:** This method does not _require_ [NVM](https://github.com/nvm-sh/nvm)

Run the following command:

```
sudo setcap cap_net_bind_service,cap_net_raw+eip $(eval readlink -f `which node`)
```

This grants the Node binary cap_net_raw & cap_net_bind_service privileges, so it can start/stop BLE advertising and listen on port 80

> **Note:** The above command requires setcap to be installed `sudo apt install libcap2-bin`

[⌐◨-◨ maintained by Taco](https://x.com/omghax)

[Made with 🔥 and ❄️ by XYO](https://xyo.network)

[logo]: https://cdn.xy.company/img/brand/XYO_full_colored.png
