#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

%subclass BrowserApplianceInfo : BRApplianceInfo

- (NSString*)key {
    return [[[NSBundle bundleForClass:[self class]] infoDictionary] objectForKey:(NSString*)kCFBundleIdentifierKey];
}

- (NSString*)name {
    return [[[NSBundle bundleForClass:[self class]] localizedInfoDictionary] objectForKey:(NSString*)kCFBundleNameKey];
}

%end

@interface TopShelfController : NSObject
@end

@implementation TopShelfController
- (void)refresh {}
- (void)selectCategoryWithIdentifier:(id)identifier {}
- (id)topShelfView { return [[%c(BRTopShelfView) alloc] init]; }
@end

%subclass BrowserController : BRController

static char const * const webViewKey = "webView";

- (UIWebView *)webView {
    return objc_getAssociatedObject(self, webViewKey);
}

- (void)setWebView:(UIWebView *)webView {
    objc_setAssociatedObject(self, webViewKey, webView, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)init {
    NSLog(@"[Browser] BrowserController init");
    if((self = %orig) != nil) {
        NSLog(@"[Browser] BrowserController initialized");
    }
    return self;
}

- (void)wasPushed {
    %orig;
    NSLog(@"[Browser] wasPushed called");
    
    if (![self webView]) {
        UIWebView *webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, 1920, 1080)];
        webView.scalesPageToFit = YES;
        webView.backgroundColor = [UIColor whiteColor];
        
        NSURL *url = [NSURL URLWithString:@"https://www.google.com"];
        NSURLRequest *request = [NSURLRequest requestWithURL:url];
        [webView loadRequest:request];
        
        [self setWebView:webView];
        
        @try {
            [[self view] addSubview:webView];
            NSLog(@"[Browser] UIWebView added successfully");
        } @catch (NSException *e) {
            NSLog(@"[Browser] Failed to add webview: %@", e);
        }
        
        [webView release];
    }
}

%end

%subclass BrowserAppliance : BRBaseAppliance

static char const * const topShelfControllerKey = "topShelfController";
static char const * const applianceCategoriesKey = "applianceCategories";

- (id)applianceInfo {
    return [[[objc_getClass("BrowserApplianceInfo") alloc] init] autorelease];
}

- (id)topShelfController { 
    return objc_getAssociatedObject(self, topShelfControllerKey); 
}

%new - (void)setTopShelfController:(id)topShelfControl { 
    objc_setAssociatedObject(self, topShelfControllerKey, topShelfControl, OBJC_ASSOCIATION_RETAIN_NONATOMIC); 
}

- (id)applianceCategories {
    return objc_getAssociatedObject(self, applianceCategoriesKey);
}

%new - (void)setApplianceCategories:(id)applianceCategories { 
    objc_setAssociatedObject(self, applianceCategoriesKey, applianceCategories, OBJC_ASSOCIATION_RETAIN_NONATOMIC); 
}

- (id)init {
    return [self initWithApplianceInfo:nil];
}

- (id)initWithApplianceInfo:(id)applianceInfo {
    if((self = %orig) != nil) {
        id topShelfControl = [[TopShelfController alloc] init];
        [self setTopShelfController:topShelfControl];
        
        id category = [%c(BRApplianceCategory) categoryWithName:@"Browser" identifier:@"browser" preferredOrder:0];
        NSArray *catArray = [[NSArray alloc] initWithObjects:category, nil];
        [self setApplianceCategories:catArray];
    }
    return self;
}

- (id)controllerForIdentifier:(id)identifier args:(id)args {
    if ([identifier isEqualToString:@"browser"]) {
        return [[[objc_getClass("BrowserController") alloc] init] autorelease];
    }
    return nil;
}

- (id)applianceName { return @"Browser"; }

%end
