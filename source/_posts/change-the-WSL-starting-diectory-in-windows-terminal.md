---
title: change the WSL starting diectory in windows terminal
date: 2021-09-27 19:41:30
update:
categories:
- [Windows]
tags:
- [Windows]
- [WSL]
- [WindowsTerminal]
cover:

---



1. Open Settings, Profiles, Ubuntu-20.04(This is your WSL terminal in Windows Terminal), General in t. 

2. Then you can see the setting of Starting directory， change the value to `\\wsl.localhost\Ubuntu-20.04\home\ubuntu`. 

   This value may be different,  you need to change the content of the ubuntu-20.04 section according to your WSL version.

3. Restart your Windows Terminal and you will be see that it has taken effect.





