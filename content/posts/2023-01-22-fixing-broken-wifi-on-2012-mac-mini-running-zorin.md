---
title: "How I fixed broken Wi-Fi on my 2012 Mac Mini running Zorin OS"
description: "If you're in this specific situation, maybe this post can help."
url: /fixing-broken-wifi-on-2012-mac-mini-running-zorin
date: 2023-01-22
---

_Skip to the end for the quick-and-dirty solution._

I recently installed [Zorin OS](https://zorin.com/os/) Lite on a 2012 Mac Mini. When I booted it up for the first time, the Wi-Fi didn't work because I didn't have the drivers. This is how I fixed it.

These steps worked for me, and I hope they're helpful for you. I suspect these instructions work on many old Macs with other Linux distros like Ubuntu. (In fact, these instructions were inspired by [a similar guide][0], which was itself inspired by [an old Ubuntu guide][1].)

At a high level, I did two things:

1. Installed the firmware for the wireless card.
2. Changed a couple of settings.

I also used an existing Intel computer, running a Debian-based OS, to download the necessary files.

## Installing the firmware

I needed to install `firmware-b43-installer`. In a perfect world, I'd run `apt install firmware-b43-installer`, but I didn't have internet access!

### Downloading the package

I learned that you can download the dependencies on one computer, ferry the downloaded `.deb` file to another, and install it there.

We can download our package like this:

```sh
# Run on a computer with internet
sudo apt install --download-only firmware-b43-installer
```

Packages are downloaded into `/var/cache/apt/archives`. Their dependencies are also downloaded, which is relevant to us because this package has a dependency.

This downloaded two files on my machine: the package, `firmware-b43-installer_GARBAGE_all.deb`; and its dependency, `b43-fwcutter_GARBAGE_amd64.deb`. (Replace "GARBAGE" with some letters and numbers I got.) I copied these to a thumb drive.

I see "amd64" in the filename, and I wonder if you'd get different results if you downloaded these packages on a computer that used a processor different from the Mac Mini, like one with an ARM chip. Maybe!

### Downloading a necessary file

I didn't realize this until I tried to install it, but the firmware package downloads a file during installation.

I downloaded [lwfinger.com/b43-firmware/broadcom-wl-5.100.138.tar.bz2](https://www.lwfinger.com/b43-firmware/broadcom-wl-5.100.138.tar.bz2) to my thumb drive, too.

### Moving the files

With everything necessary downloaded, I ferried the files to the Mac Mini. I put the files on the Desktop, but you could put them anywhere.

### Setting up a web server

Earlier, I mentioned that the firmware downloads a file during installation. Specifically, it tries to download a file from this URL:

    https://www.lwfinger.com/b43-firmware/broadcom-wl-5.100.138.tar.bz2

It can't do that without internet access, so we'll have to set up a fake web server.

First, I edited `/etc/hosts` so we could lie about where `www.lwfinger.com` lives, pretending it lived on my machine. I added the following entry with `sudo vi /etc/hosts`:

    127.0.0.1	www.lwfinger.com

Next, I started a fake web server. You can start a web server in many different ways, but Python's built-in worked for me. Here's what I did to set that up:

```sh
cd ~/Desktop

# Set up the folder structure
mkdir -p server/b43-firmware
mv broadcom-wl-5.100.138.tar.bz2 server/b43-firmware

# Start the Python web server
cd server
sudo python3 -m http.server 80
```

I visited `http://www.lwfinger.com` in the browser and verified that it was serving the file correctly, and from the correct path.

I left this running and opened a new Terminal tab, and undid this work when I was all done.

### Installing the packages

Everything was now set up, and I just needed to install the packages.

I don't know the details, but `apt` is a "frontend" for `dpkg`, Debian's package manager. So I just used `dpkg` to install things.

I installed the dependency package first:

```sh
sudo dpkg --install ~/Desktop/b43-fwcutter_GARBAGE_amd64.deb
```

Then I installed the main package:

```sh
sudo dpkg --install ~/firmware-b43-installer_GARBAGE_all.deb
```

The hard part was out of the way: I'd successfully installed the firmware. Now to tweak a couple of settings.

## Changing some settings

[The Ubuntu guide I roughly followed][1] mentions two additional things, which I'm regurgitating here.

1. Edit `/etc/modprobe.d/blacklist.conf` and add the following line:

   ```
   blacklist ndiswrapper
   ```

1. Create `/etc/pm/config.d/modules` and block some modules:

   ```
   SUSPEND_MODULES="b43 bcma"
   ```

I used `sudo` to accomplish all of this.

I don't know what either of these do, but my vague understanding is that these prevent certain parts of the driver from running.

With all that done, I restarted the machine and _voilà_! I was online.

If you've read up to this point, you can stop reading. I hope this has helped you!

If you want a quick-and-dirty summary, read on.

## Quick-and-dirty summary

You'll need an online computer with `apt` on it (i.e., not your Mac Mini). You might need to do some extra work if this computer doesn't have a 64-bit Intel processor.

1. On the online computer, put the dependencies on an external drive.

   1. Run `sudo apt install --download-only firmware-b43-installer` to download the package and its dependency.
   1. Copy `/var/cache/apt/archives/b43-fwcutter_*_amd64.deb` to your external drive.
   1. Copy `/var/cache/apt/archives/firmware-b43-installer_*_all.deb` to your external drive.
   1. Download `https://www.lwfinger.com/b43-firmware/broadcom-wl-5.100.138.tar.bz2` and put it on the external drive.

1. Move the external drive to your Mac Mini and copy all 3 files to the Desktop. (These instructions assume you put things on the Desktop, but you can put them anywhere.)

1. On the Mac Mini, install the wireless driver.

   1. Tell the installer to look at your "fake" web server by running `echo '127.0.0.1 www.lwfinger.com' | sudo tee --append /etc/hosts`.
   1. Create the folder structure for your server by running `mkdir -p ~/Desktop/server/b43-firmware`, then `mv ~/Desktop/broadcom-wl-5.100.138.tar.bz2 ~/Desktop/server/b43-firmware`.
   1. Start the server by running `cd ~/Desktop/server && sudo python3 -m http.server 80`. Leave this running
   1. Open a new Terminal tab.
   1. Install the dependency by running `sudo dpkg --install ~/Desktop/b43-fwcutter_*.deb`.
   1. Install the firmware by running `sudo dpkg --install ~/Desktop/firmware-b43-installer_*.deb`.

1. Update a couple of settings on the Mac Mini.

   1. `echo 'blacklist ndiswrapper' | sudo tee --append /etc/modprobe.d/blacklist.conf`
   1. `sudo mkdir -p /etc/pm/config.d`
   1. `echo 'SUSPEND_MODULES="b43 bcma"' | sudo tee --append /etc/pm/config.d/modules`

1. Restart the Mac Mini. Your Wi-Fi should now work!

I hope this guide helps anyone in a similar situation!

[0]: https://gist.github.com/niftylettuce/5619c2be9906bcbd893e1e1a25b9d795
[1]: https://help.ubuntu.com/community/Macmini5-1/Precise
