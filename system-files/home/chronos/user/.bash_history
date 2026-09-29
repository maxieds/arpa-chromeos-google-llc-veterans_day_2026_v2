/usr/sbin/chromeos-recovery --help
/usr/sbin/chromeos-install --help
/usr/sbin/chromeos-install --help >> /home/chronos/NEW-logs/chromeos-install-help.1.out 2>&1
/usr/sbin/chromeos-install-kernel --help
which /usr/sbin/chromeos-install.sh 
vi /usr/sbin/chromeos-install.sh 
cp -RapL /usr/sbin/chromeos-install.sh /media/removable/USB\ DISK/ChromeOS/crosh-system-files/usr-sbin-chromeos-install.sh 
tar cvjpf /media/removable/USB\ DISK/ChromeOS/crosh-system-files/usr-share_lib-firmware.tar.bz2 /lib/firmware/* /usr/share/*
tar tf /media/removable/USB\ DISK/ChromeOS/crosh-system-files/usr-share_lib-firmware.tar.bz2 
