include $(THEOS)/makefiles/common.mk

BUNDLE_NAME = SimpleApp
SimpleApp_BUNDLE_EXTENSION = frappliance
SimpleApp_FILES = Classes/SimpleAppliance.xm
SimpleApp_INSTALL_PATH = /Applications/Lowtide.app/Appliances
SimpleApp_RESOURCE_DIRS = Resources
SimpleApp_RESOURCE_FILES = Resources/icon.png

include $(THEOS_MAKE_PATH)/bundle.mk

after-install::
	install.exec "killall -9 AppleTV || true"
