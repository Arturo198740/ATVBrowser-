#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

static UIWebView *gWebView = nil;
static id gDelegate = nil;
static id gController = nil;
static int gMenuIndex = 0;
static BOOL gInMenu = YES;
static BOOL gKeyboardVisible = NO;
static UIView *gKeyboardView = nil;
static NSMutableString *gSearchText = nil;
static UILabel *gSearchLabel = nil;
static int gKeyIndex = 0;
static UIView *gCursorView = nil;
static CGPoint gCursorPosition;
static NSString *gPolyfills = nil;
static NSMutableArray *gKeyLabels = nil;
static NSDate *gLastButtonPress = nil;

static NSArray *KEY_STRINGS = nil;

// Forward declarations
__attribute__((unused)) static void loadPolyfills();
__attribute__((unused)) static void initKeyboard();
__attribute__((unused)) static void showKeyboard();
__attribute__((unused)) static void updateKeyboard();
__attribute__((unused)) static void hideKeyboard();
__attribute__((unused)) static void showMenu();
__attribute__((unused)) static void updateCursor(NSString *rectString);
__attribute__((unused)) static void initCursor();
__attribute__((unused)) static void performTouchAtCursor();
__attribute__((unused)) static void loadSite(int index);

@interface BRMediaMenuController : NSObject
- (void)setListTitle:(id)title;
@end

@interface BRApplianceCategory : NSObject
+ (id)categoryWithName:(id)name identifier:(id)identifier preferredOrder:(int)order;
@end

@interface WebViewDelegate : NSObject <UIWebViewDelegate>
@end

@implementation WebViewDelegate

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSLog(@"[Browser] Loading: %@", request.URL);
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:@"Loading..."];
    }
    return YES;
}

- (void)webViewDidStartLoad:(UIWebView *)webView {
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
    if (gPolyfills && gPolyfills.length > 0) {
        [webView stringByEvaluatingJavaScriptFromString:gPolyfills];
        NSLog(@"[Browser] Polyfills injected");
    }
    
    NSString *title = [gWebView stringByEvaluatingJavaScriptFromString:@"document.title"];
    NSLog(@"[Browser] Page loaded: %@", title);
    
    [webView stringByEvaluatingJavaScriptFromString:@"window.focusIndex = -1; window.focusableElements = [];"];
    
    [webView stringByEvaluatingJavaScriptFromString:@"window.updateFocusable = function() { var all = document.querySelectorAll('a, button, input, textarea, [role=button], [type=submit]'); window.focusableElements = []; for(var i=0; i<all.length; i++) { var r = all[i].getBoundingClientRect(); if(r.width > 0 && r.height > 0) window.focusableElements.push(all[i]); } };"];
    
    [webView stringByEvaluatingJavaScriptFromString:@"window.focusNext = function() { window.updateFocusable(); if(window.focusableElements.length === 0) return ''; window.focusIndex = (window.focusIndex + 1) % window.focusableElements.length; var el = window.focusableElements[window.focusIndex]; el.scrollIntoView(); var rect = el.getBoundingClientRect(); return rect.left + ',' + rect.top + ',' + rect.width + ',' + rect.height; };"];
    
    [webView stringByEvaluatingJavaScriptFromString:@"window.focusPrev = function() { window.updateFocusable(); if(window.focusableElements.length === 0) return ''; window.focusIndex = (window.focusIndex - 1 + window.focusableElements.length) % window.focusableElements.length; var el = window.focusableElements[window.focusIndex]; el.scrollIntoView(); var rect = el.getBoundingClientRect(); return rect.left + ',' + rect.top + ',' + rect.width + ',' + rect.height; };"];
    
    [webView stringByEvaluatingJavaScriptFromString:@"window.getCurrentRect = function() { if(window.focusIndex < 0 || window.focusIndex >= window.focusableElements.length) return ''; var el = window.focusableElements[window.focusIndex]; var rect = el.getBoundingClientRect(); return rect.left + ',' + rect.top + ',' + rect.width + ',' + rect.height; };"];
    
    [webView stringByEvaluatingJavaScriptFromString:@"window.isInput = function() { if(window.focusIndex >= 0 && window.focusIndex < window.focusableElements.length) { var el = window.focusableElements[window.focusIndex]; return (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') || el.tagName === 'TEXTAREA' ? 'YES' : 'NO'; } return 'NO'; };"];
    
    [webView stringByEvaluatingJavaScriptFromString:@"setTimeout(function() { var inp = document.querySelector('input[name=q], input[type=text], input[type=search], textarea'); if(inp) { window.focusIndex = 0; window.updateFocusable(); } }, 500);"];
    
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:title ? title : @"Ready"];
    }
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    if (error.code == -999) return;
    NSLog(@"[Browser] Error: %@", error);
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:@"Error"];
    }
}

@end

static void loadPolyfills() {
    if (gPolyfills) return;
    
    NSString *path = @"/Applications/Lowtide.app/Appliances/SimpleApp.frappliance/polyfills.js";
    NSError *error = nil;
    gPolyfills = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:&error];
    
    if (error || !gPolyfills) {
        NSLog(@"[Browser] Polyfills load failed: %@", error);
        gPolyfills = @"console.log('Polyfills not loaded');";
    } else {
        NSLog(@"[Browser] Polyfills loaded: %lu bytes", (unsigned long)gPolyfills.length);
    }
    
    [gPolyfills retain];
}

static void initKeyboard() {
    if (KEY_STRINGS) return;
    
    KEY_STRINGS = [@[
        @"a", @"b", @"c", @"d", @"e", @"f", @"g", @"h", @"i", @"j",
        @"k", @"l", @"m", @"n", @"o", @"p", @"q", @"r", @"s", @"t",
        @"u", @"v", @"w", @"x", @"y", @"z",
        @"0", @"1", @"2", @"3", @"4", @"5", @"6", @"7", @"8", @"9",
        @" "
    ] retain];
}

static void updateCursor(NSString *rectString) {
    if (!rectString || [rectString isEqualToString:@""]) {
        if (gCursorView) gCursorView.hidden = YES;
        return;
    }
    
    NSArray *parts = [rectString componentsSeparatedByString:@","];
    if (parts.count != 4) return;
    
    CGFloat left = [parts[0] floatValue];
    CGFloat top = [parts[1] floatValue];
    CGFloat width = [parts[2] floatValue];
    CGFloat height = [parts[3] floatValue];
    
    gCursorPosition = CGPointMake(left + width/2, top + height/2);
    
    if (gCursorView) {
        gCursorView.hidden = NO;
        gCursorView.center = gCursorPosition;
    }
}

static void initCursor() {
    if (gCursorView) return;
    
    UIWindow *mainWindow = [[UIApplication sharedApplication] keyWindow];
    
    gCursorView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 30, 40)];
    gCursorView.backgroundColor = [UIColor clearColor];
    gCursorView.hidden = YES;
    
    CAShapeLayer *arrow = [CAShapeLayer layer];
    UIBezierPath *path = [UIBezierPath bezierPath];
    [path moveToPoint:CGPointMake(3, 3)];
    [path addLineToPoint:CGPointMake(3, 32)];
    [path addLineToPoint:CGPointMake(11, 25)];
    [path addLineToPoint:CGPointMake(16, 35)];
    [path addLineToPoint:CGPointMake(19, 33)];
    [path addLineToPoint:CGPointMake(14, 23)];
    [path addLineToPoint:CGPointMake(24, 23)];
    [path closePath];
    
    arrow.path = path.CGPath;
    arrow.fillColor = [UIColor blackColor].CGColor;
    arrow.strokeColor = [UIColor whiteColor].CGColor;
    arrow.lineWidth = 2;
    
    [gCursorView.layer addSublayer:arrow];
    
    [mainWindow addSubview:gCursorView];
}

static void performTouchAtCursor() {
    if (!gWebView || gCursorView.hidden) return;
    
    NSString *isInput = [gWebView stringByEvaluatingJavaScriptFromString:@"window.isInput();"];
    if ([isInput isEqualToString:@"YES"]) {
        showKeyboard();
        updateKeyboard();
        return;
    }
    
    NSString *jsCode = [NSString stringWithFormat:
        @"(function() {"
        @"  var x = %f; var y = %f;"
        @"  var el = document.elementFromPoint(x, y);"
        @"  if (!el) return 'NO_ELEMENT';"
        @"  if (el.tagName === 'A' && el.href) { window.location.href = el.href; return 'NAVIGATING'; }"
        @"  if (el.tagName === 'BUTTON' || (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button'))) {"
        @"    if (el.form) { el.form.submit(); return 'SUBMITTED'; }"
        @"  }"
        @"  return 'ELEMENT:' + el.tagName;"
        @"})();",
        gCursorPosition.x, gCursorPosition.y];
    
    NSString *result = [gWebView stringByEvaluatingJavaScriptFromString:jsCode];
    
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:[NSString stringWithFormat:@"%@", result ? result : @"Tapped"]];
    }
}

static void showMenu() {
    NSArray *sites = @[@"Google", @"Bing", @"Yandex", @"DuckDuckGo"];
    
    // Create menu with Safari-style header and compass icon
    NSMutableString *html = [NSMutableString stringWithString:
        @"<html><head><title>Menu</title>"
        @"<meta name='viewport' content='width=device-width, initial-scale=1'>"
        @"<style>"
        @"body{background:#000;color:#0f0;font-family:monospace;font-size:48px;padding:28px;line-height:1.3;margin:0;}"
        @".header{display:flex;align-items:center;margin-bottom:30px;}"
        @".compass{"
        @"  width:100px;height:100px;margin-right:25px;"
        @"  border-radius:50%;background:linear-gradient(135deg, #2890FF 0%, #1E5FFF 100%);"
        @"  position:relative;box-shadow:0 4px 20px rgba(30,144,255,0.5);"
        @"}"
        @".needle{"
        @"  position:absolute;top:50%;left:50%;width:0;height:0;"
        @"  border-left:8px solid transparent;border-right:8px solid transparent;"
        @"  border-bottom:45px solid #E62E2E;transform:translate(-50%,-70%) rotate(-45deg);"
        @"  transform-origin:center bottom;"
        @"}"
        @".needle-white{"
        @"  border-bottom:45px solid #F5F5F5;transform:translate(-50%,-70%) rotate(135deg);"
        @"}"
        @"h1{color:#0f0;font-size:64px;margin:0;}"
        @".subtitle{color:#0a0;font-size:28px;margin-top:5px;}"
        @".item{padding:14px;margin:8px 0;border-left:4px solid transparent;}"
        @".sel{background:#0f0;color:#000;font-weight:bold;padding:14px;border-left:4px solid #0f0;}"
        @"</style></head><body>"
        @"<div class='header'>"
        @"<div class='compass'>"
        @"  <div class='needle'></div>"
        @"  <div class='needle needle-white'></div>"
        @"</div>"
        @"<div>"
        @"  <h1>SAFARI</h1>"
        @"  <div class='subtitle'>Apple TV Browser</div>"
        @"</div>"
        @"</div>"];
    
    for (int i = 0; i < sites.count; i++) {
        if (i == gMenuIndex) {
            [html appendFormat:@"<div class='sel'>▶ %@</div>", sites[i]];
        } else {
            [html appendFormat:@"<div class='item'>  %@</div>", sites[i]];
        }
    }
    
    [html appendString:@"</body></html>"];
    
    [gWebView loadHTMLString:html baseURL:nil];
    gInMenu = YES;
    
    if (gCursorView) gCursorView.hidden = YES;
    
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:[NSString stringWithFormat:@"%@", sites[gMenuIndex]]];
    }
}

static void showKeyboard() {
    initKeyboard();
    
    if (gSearchText == nil) {
        gSearchText = [[NSMutableString stringWithString:@""] retain];
    }
    
    UIWindow *mainWindow = [[UIApplication sharedApplication] keyWindow];
    
    if (gKeyboardView == nil) {
        gKeyboardView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 1280, 720)];
        gKeyboardView.backgroundColor = [UIColor colorWithWhite:0.1 alpha:0.95];
        
        gSearchLabel = [[UILabel alloc] initWithFrame:CGRectMake(50, 50, 1180, 80)];
        gSearchLabel.backgroundColor = [UIColor whiteColor];
        gSearchLabel.textColor = [UIColor blackColor];
        gSearchLabel.font = [UIFont fontWithName:@"Helvetica" size:50];
        gSearchLabel.textAlignment = NSTextAlignmentLeft;
        [gKeyboardView addSubview:gSearchLabel];
        
        UILabel *help = [[UILabel alloc] initWithFrame:CGRectMake(50, 150, 1180, 50)];
        help.backgroundColor = [UIColor clearColor];
        help.textColor = [UIColor yellowColor];
        help.font = [UIFont fontWithName:@"Helvetica" size:32];
        help.text = @"LEFT/RIGHT=Move  UP=Delete  DOWN=Add  ENTER=Search  MENU=Cancel";
        help.textAlignment = NSTextAlignmentCenter;
        [gKeyboardView addSubview:help];
        
        gKeyLabels = [[NSMutableArray alloc] init];
        
        for (int i = 0; i < [KEY_STRINGS count]; i++) {
            int row = i / 10;
            int col = i % 10;
            
            UILabel *keyLabel = [[UILabel alloc] initWithFrame:CGRectMake(50 + col * 118, 220 + row * 100, 110, 90)];
            keyLabel.backgroundColor = [UIColor colorWithWhite:0.2 alpha:1.0];
            keyLabel.textAlignment = NSTextAlignmentCenter;
            keyLabel.font = [UIFont fontWithName:@"Helvetica" size:60];
            keyLabel.textColor = [UIColor greenColor];
            
            NSString *keyStr = [KEY_STRINGS objectAtIndex:i];
            if ([keyStr isEqualToString:@" "]) {
                keyLabel.text = @"SPC";
            } else {
                keyLabel.text = keyStr;
            }
            
            [gKeyLabels addObject:keyLabel];
            [gKeyboardView addSubview:keyLabel];
        }
        
        [mainWindow addSubview:gKeyboardView];
    }
    
    gKeyboardView.hidden = NO;
    gKeyboardVisible = YES;
    gKeyIndex = 0;
    
    if (gCursorView) gCursorView.hidden = YES;
    
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:@"Keyboard"];
    }
    
    updateKeyboard();
}

static void updateKeyboard() {
    gSearchLabel.text = [NSString stringWithFormat:@" %@_", gSearchText];
    
    for (int i = 0; i < [gKeyLabels count]; i++) {
        UILabel *label = [gKeyLabels objectAtIndex:i];
        if (i == gKeyIndex) {
            label.backgroundColor = [UIColor greenColor];
            label.textColor = [UIColor blackColor];
        } else {
            label.backgroundColor = [UIColor colorWithWhite:0.2 alpha:1.0];
            label.textColor = [UIColor greenColor];
        }
    }
}

static void hideKeyboard() {
    if (gKeyboardView) {
        gKeyboardView.hidden = YES;
    }
    gKeyboardVisible = NO;
    
    if (gSearchText && gSearchText.length > 0) {
        NSString *query = [gSearchText stringByReplacingOccurrencesOfString:@" " withString:@"+"];
        
        NSString *currentURL = [gWebView stringByEvaluatingJavaScriptFromString:@"window.location.href"];
        
        NSString *searchURL = nil;
        
        if ([currentURL rangeOfString:@"google"].location != NSNotFound) {
            // Google basic search
            searchURL = [NSString stringWithFormat:@"https://www.google.com/search?q=%@", query];
        } else if ([currentURL rangeOfString:@"bing"].location != NSNotFound) {
            searchURL = [NSString stringWithFormat:@"https://www.bing.com/search?q=%@", query];
        } else if ([currentURL rangeOfString:@"yandex"].location != NSNotFound) {
            // Yandex .com version
            searchURL = [NSString stringWithFormat:@"https://yandex.com/search/?text=%@", query];
        } else if ([currentURL rangeOfString:@"duckduckgo"].location != NSNotFound) {
            searchURL = [NSString stringWithFormat:@"https://lite.duckduckgo.com/lite/?q=%@", query];
        }
        
        if (searchURL) {
            NSLog(@"[Browser] Searching: %@", searchURL);
            NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:searchURL]];
            [request setValue:@"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.59.10 (KHTML, like Gecko) Version/5.1.9 Safari/534.59.10" forHTTPHeaderField:@"User-Agent"];
            [request setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
            [gWebView loadRequest:request];
        }
        
        [gSearchText setString:@""];
    }
    
    NSString *rectString = [gWebView stringByEvaluatingJavaScriptFromString:@"window.getCurrentRect();"];
    updateCursor(rectString);
}

static void loadSite(int index) {
    NSArray *sites = @[@"Google", @"Bing", @"Yandex", @"DuckDuckGo"];
    NSArray *urls = @[
        @"https://www.google.com/search",  // Google search homepage
        @"https://www.bing.com/",
        @"https://yandex.com/",  // Use .com instead of .ru
        @"https://lite.duckduckgo.com/lite/"
    ];
    
    if (index < 0 || index >= sites.count) return;
    
    if (gController && [gController respondsToSelector:@selector(setListTitle:)]) {
        [gController setListTitle:[NSString stringWithFormat:@"Loading %@", sites[index]]];
    }
    
    NSLog(@"[Browser] Loading site %d: %@", index, urls[index]);
    
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:urls[index]]];
    // Use old Safari user agent for compatibility
    [request setValue:@"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.59.10 (KHTML, like Gecko) Version/5.1.9 Safari/534.59.10" forHTTPHeaderField:@"User-Agent"];
    [request setCachePolicy:NSURLRequestReloadIgnoringLocalCacheData];
    [request setTimeoutInterval:30.0];
    
    [gWebView loadRequest:request];
    
    gInMenu = NO;
}

%subclass SimpleApplianceInfo : BRApplianceInfo
- (NSString*)key { 
    return @"com.custom.browser"; 
}
- (NSString*)name { 
    return @"Safari"; 
}
%end

@interface SimpleTopShelfController : NSObject
@end

@implementation SimpleTopShelfController
- (void)refresh {}
- (void)selectCategoryWithIdentifier:(id)identifier {}
- (id)topShelfView { 
    return [[%c(BRTopShelfView) alloc] init]; 
}
@end

%subclass SimpleController : BRMediaMenuController

- (id)init {
    if((self = %orig) != nil) {
        gController = self;
        [self setListTitle:@"Safari"];
        loadPolyfills();
        initKeyboard();
    }
    return self;
}

- (void)wasPushed {
    %orig;
    
    UIWindow *mainWindow = [[UIApplication sharedApplication] keyWindow];
    
    if (gWebView == nil && mainWindow) {
        CGRect screenBounds = [[UIScreen mainScreen] bounds];
        
        gWebView = [[UIWebView alloc] initWithFrame:screenBounds];
        gWebView.scalesPageToFit = YES;
        gWebView.backgroundColor = [UIColor blackColor];
        gWebView.opaque = YES;
        gWebView.hidden = NO;
        gWebView.userInteractionEnabled = YES;
        gWebView.allowsInlineMediaPlayback = YES;
        gWebView.mediaPlaybackRequiresUserAction = NO;
        
        gDelegate = [[WebViewDelegate alloc] init];
        gWebView.delegate = gDelegate;
        
        [mainWindow addSubview:gWebView];
        [mainWindow bringSubviewToFront:gWebView];
        
        initCursor();
    } else {
        [mainWindow bringSubviewToFront:gWebView];
        gWebView.hidden = NO;
    }
    
    gMenuIndex = 0;
    gInMenu = YES;
    showMenu();
}

- (void)wasPopped {
    %orig;
    if (gWebView) gWebView.hidden = YES;
    if (gKeyboardView) gKeyboardView.hidden = YES;
    if (gCursorView) gCursorView.hidden = YES;
}

- (BOOL)brEventAction:(id)action {
    if ([action respondsToSelector:@selector(remoteAction)]) {
        long button = (long)[action performSelector:@selector(remoteAction)];
        
        NSDate *now = [NSDate date];
        if (gLastButtonPress && button != 5 && button != 1) {
            NSTimeInterval elapsed = [now timeIntervalSinceDate:gLastButtonPress];
            if (elapsed < 0.2) {
                return YES;
            }
        }
        gLastButtonPress = [now retain];
        
        NSLog(@"[Browser] BUTTON: %ld", button);
        
        if (gKeyboardVisible) {
            if (!KEY_STRINGS) return YES;
            
            int keyCount = (int)[KEY_STRINGS count];
            
            if (button == 1) { 
                gKeyboardView.hidden = YES;
                gKeyboardVisible = NO;
                [gSearchText setString:@""];
                return YES; 
            }
            
            if (button == 6) { 
                gKeyIndex = (gKeyIndex - 1 + keyCount) % keyCount;
                updateKeyboard(); 
                return YES; 
            }
            
            if (button == 7) { 
                gKeyIndex = (gKeyIndex + 1) % keyCount;
                updateKeyboard(); 
                return YES; 
            }
            
            if (button == 3) { 
                if (gSearchText.length > 0) { 
                    [gSearchText deleteCharactersInRange:NSMakeRange(gSearchText.length - 1, 1)]; 
                    updateKeyboard(); 
                } 
                return YES; 
            }
            
            if (button == 4) { 
                NSString *key = [KEY_STRINGS objectAtIndex:gKeyIndex];
                [gSearchText appendString:key];
                updateKeyboard(); 
                return YES; 
            }
            
            if (button == 5) { 
                hideKeyboard();
                return YES; 
            }
            
            return YES;
        }
        
        if (gInMenu) {
            if (button == 1) { 
                if (gWebView) gWebView.hidden = YES; 
                return %orig; 
            }
            
            if (button == 3) { 
                gMenuIndex = (gMenuIndex - 1 + 4) % 4; 
                showMenu(); 
                return YES; 
            }
            
            if (button == 4) { 
                gMenuIndex = (gMenuIndex + 1) % 4; 
                showMenu(); 
                return YES; 
            }
            
            if (button == 5) { 
                loadSite(gMenuIndex); 
                return YES; 
            }
            
            return YES;
        }
        
        if (button == 1) { 
            gMenuIndex = 0; 
            showMenu(); 
            return YES; 
        }
        
        if (button == 6) {
            NSString *rectString = [gWebView stringByEvaluatingJavaScriptFromString:@"window.focusPrev();"];
            updateCursor(rectString);
            return YES;
        }
        
        if (button == 7) {
            NSString *rectString = [gWebView stringByEvaluatingJavaScriptFromString:@"window.focusNext();"];
            updateCursor(rectString);
            return YES;
        }
        
        if (button == 5) {
            performTouchAtCursor();
            return YES;
        }
        
        return YES;
    }
    
    return %orig;
}

%end

%subclass SimpleAppliance : BRBaseAppliance

- (id)applianceInfo { 
    return [[[%c(SimpleApplianceInfo) alloc] init] autorelease]; 
}

- (id)topShelfController { 
    return [[[SimpleTopShelfController alloc] init] autorelease]; 
}

- (id)applianceCategories {
    return [NSArray arrayWithObject:[%c(BRApplianceCategory) categoryWithName:@"Safari" identifier:@"browser" preferredOrder:0]];
}

- (id)controllerForIdentifier:(id)identifier args:(id)args {
    return [[[%c(SimpleController) alloc] init] autorelease];
}

%end
