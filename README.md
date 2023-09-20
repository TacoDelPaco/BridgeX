[![logo][]](https://xyo.network)

# BridgeX Modified
I created this repository as a reference for anyone wanting to setup a BridgeX on a Raspberry Pi Zero 1.1/2 W, but theoretically it should work on just about anything.

It basically is an upgrade to using [@abandonware/bleno](https://github.com/abandonware/bleno), [@abandonware/noble](https://github.com/abandonware/noble) and [@abandonware/bluetooth-hci-socket](https://github.com/abandonware/bluetooth-hci-socket) which allows NodeJS 12+ (I'm using 20.5.1 with [NVM](https://github.com/nvm-sh/nvm)) to be used inconjunction with the latest Raspbian OS.

I will try to document my process and guide through the installation, feel free to message me if you have any questions. I will also make quality of life changes throughout the codebase, as there is a lot of unneccesary or unused portions.

### Raspberry Pi Zero 1.1 W and original img
If you're wanting to use the original **bridgex.img** with the RPiZW, you can simply run `sudo npm rebuild --unsafe-perm --build-from-source` in `/usr/lib/node_modules/` to get it running and you don't need this repo.

## Bare Minimum
> **Note:** I've tested this with Raspbian OS 11 on a Raspberry Pi Zero 2 W and with Raspbian OS 10 on a Raspberry Pi Zero 1.1 W

1. Clone the repository in home directory
   `git clone https://github.com/TacoDelPaco/BridgeX`
2. Run `npm rebuild --unsafe-perm --build-from-source` in the root of the project directory
3. Run `node node_modules/@xyo-network/bridge.pi/bin/start.js` or `npm start`

Everything should be running, although you may want to put it in a `screen` or `tmux` to be able to run in the background. The web side of things also doesn't work, as it requires more steps which I include in the next section.

## Everything Else
> **Note:** Be sure and edit `<RPi Username>` in each file to whatever you set the Raspbian OS username to when setting it up/formatting
1. Create a file at `/etc/xdg/lxsession/LXDE-pi/autostart` and paste the following:
```
#@lxpanel --profile LXDE-pi
#@pcmanfm --desktop --profile LXDE-pi
#@xscreensaver -no-splash
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --noerrdialogs --disable-infobars --kiosk --app=file:///home/<RPi USERNAME>/BridgeX/bridge-client/loader.html
```
2. Create a symbolic link `sudo ln -s /home/<RPi Username>/BridgeX/node_modules/@xyo-network/bridge.pi/bin/start.js /usr/bin/xyo-pi-bridge` and edit the file:
```
#!/usr/bin/env node

const { main } = require('../dist/index.js');

main()
```
3. Create a file at `/usr/local/bin/xyo-bridge-start.sh`, run `sudo chmod +x /usr/local/bin/xyo-bridge-start.sh` and paste the following:
```
#!/bin/bash

sudo PORT=80 STORE=/home/<RPi Username>/BridgeX/bridge-store STATIC=/home/<RPi Username>/bridge-client /usr/bin/node /usr/bin/xyo-pi-bridge
```
4. Create a file at `/etc/systemd/system/xyo-bridge.service` and paste the following:
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

You should now have a fully automated BridgeX running on an updated NodeJS, OS, RPiZ2W, etc.

## NVM / sudoless
> **Note:** Be sure and edit `<RPi Username>` in each file to whatever you set the Raspbian OS username to when setting it up/formatting

Running `nvm`, `sudo` won't work, so you'll need to either allow `sudo` or configure to allow access with `node`

### Running with sudo
1. Edit `~/.nvm/nvm.sh` and paste the following:
```
alias node='$NVM_BIN/node'
# possibly adding an alias for npm as well?
alias sudo='sudo '
```

### Running without sudo
1. Run the following command:

```
sudo setcap cap_net_bind_service,cap_net_raw+eip $(eval readlink -f `which node`)
```

This grants the Node binary cap_net_raw & cap_net_bind_service privileges, so it can start/stop BLE advertising and listen on port 80

> **Note:** The above command requires setcap to be installed, also this method does not _require_ [NVM](https://github.com/nvm-sh/nvm)

`sudo apt-get install libcap2-bin`

### NVM

> You'll also need to edit wherever `node` is linked and replace it with a static link to the NVM version you're using
1. Edit `/usr/bin/xyo-bridge` and change the first line to the results of `which node`:
```
#!/home/<RPi Username>/.nvm/versions/node/v<NodeJS Version>/bin/node

const { main } = require('../dist/index.js');

main()
```
2. Edit `/usr/local/bin/xyo-bridge-start.sh` and change where `node` is referenced:
```
#!/bin/bash

sudo PORT=80 STORE=/home/<RPi USERNAME>/BridgeX/bridge-store STATIC=/home/<RPi USERNAME>/bridge-client /home/<RPi Username>/.nvm/versions/node/v<NodeJS Version>/bin/node /usr/bin/xyo-pi-bridge
```

[⌐◨-◨ maintained by Taco](https://x.com/omghax)

[Made with 🔥 and ❄️ by XYO](https://xyo.network)

[logo]: https://cdn.xy.company/img/brand/XYO_full_colored.png
