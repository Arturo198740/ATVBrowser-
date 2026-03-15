#import <Foundation/Foundation.h>

%subclass SimpleMenuController : BRMediaMenuController

static char const * const menuItemsKey = "menuItems";

- (id)init {
    NSLog(@"[SimpleApp] SimpleMenuController init START");
    if((self = %orig) != nil) {
        NSLog(@"[SimpleApp] SimpleMenuController init - calling setListTitle");
        
        [self setListTitle:@"Simple App"];
        
        NSLog(@"[SimpleApp] SimpleMenuController init - creating items");
        NSMutableArray *items = [[NSMutableArray alloc] init];
        [items addObject:@"Option 1"];
        [items addObject:@"Option 2"];
        [items addObject:@"Option 3"];
        
        objc_setAssociatedObject(self, menuItemsKey, items, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        [items release];
        
        NSLog(@"[SimpleApp] SimpleMenuController init - setting datasource, item count: %ld", (long)[items count]);
        [[self list] setDatasource:self];
        
        NSLog(@"[SimpleApp] SimpleMenuController init COMPLETE");
        return self;
    }
    NSLog(@"[SimpleApp] SimpleMenuController init FAILED");
    return self;
}

%new - (id)menuItems {
    id items = objc_getAssociatedObject(self, menuItemsKey);
    NSLog(@"[SimpleApp] menuItems called, returning %ld items", (long)[items count]);
    return items;
}

%new - (void)setMenuItems:(id)items {
    NSLog(@"[SimpleApp] setMenuItems called");
    objc_setAssociatedObject(self, menuItemsKey, items, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (long)itemCount {
    long count = [[self menuItems] count];
    NSLog(@"[SimpleApp] itemCount called, returning %ld", count);
    return count;
}

- (id)itemForRow:(long)row {
    id item = [[self menuItems] objectAtIndex:row];
    NSLog(@"[SimpleApp] itemForRow:%ld returning %@", row, item);
    return item;
}

- (id)titleForRow:(long)row {
    id title = [[self menuItems] objectAtIndex:row];
    NSLog(@"[SimpleApp] titleForRow:%ld returning %@", row, title);
    return title;
}

- (float)heightForRow:(long)row {
    NSLog(@"[SimpleApp] heightForRow:%ld returning 0.0", row);
    return 0.0f;
}

- (BOOL)rowSelectable:(long)row {
    NSLog(@"[SimpleApp] rowSelectable:%ld returning YES", row);
    return YES;
}

- (id)previewControlForItem:(long)item {
    NSLog(@"[SimpleApp] previewControlForItem:%ld", item);
    id theImage = [[%c(BRThemeInfo) sharedTheme] largeGeniusIconWithReflection];
    id obj = [[%c(BRIconPreviewController) alloc] init];
    [obj setImage:theImage];
    return [obj autorelease];
}

- (void)itemSelected:(long)selected {
    NSLog(@"[SimpleApp] itemSelected:%ld", selected);
}

%end
