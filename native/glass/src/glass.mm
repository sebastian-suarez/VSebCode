/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Inserts an NSGlassEffectView (macOS 26 and newer) below the web contents of an Electron
// BrowserWindow. The handle is the Buffer returned by `BrowserWindow.getNativeWindowHandle()`,
// which holds the pointer to the window's content view; the glass view becomes its bottom-most
// subview and resizes with it. Everything runs on the main thread, which is where Electron's
// main process executes JavaScript.

#include <node_api.h>
#import <AppKit/AppKit.h>
#import <QuartzCore/QuartzCore.h>
#include <map>
#include <string>

// NSGlassEffectView exists in the macOS 26 SDK and later; an older SDK builds a module that reports no support.
#if defined(__MAC_26_0)
#define VSEBCODE_GLASS_SDK 1
#else
#define VSEBCODE_GLASS_SDK 0
#endif

namespace {

struct Entry {
	__weak NSView* view; // the window's content view owns the layer; a closed window leaves nil behind
};

std::map<int32_t, Entry> g_entries;
int32_t g_nextId = 1;

bool IsSupported() {
#if VSEBCODE_GLASS_SDK
	if (@available(macOS 26.0, *)) {
		return NSClassFromString(@"NSGlassEffectView") != nil;
	}
#endif
	return false;
}

bool GetString(napi_env env, napi_value object, const char* key, std::string& out) {
	bool has = false;
	napi_value value;
	if (napi_has_named_property(env, object, key, &has) != napi_ok || !has || napi_get_named_property(env, object, key, &value) != napi_ok) {
		return false;
	}
	napi_valuetype type;
	napi_typeof(env, value, &type);
	if (type != napi_string) {
		return false;
	}
	size_t length = 0;
	napi_get_value_string_utf8(env, value, nullptr, 0, &length);
	out.resize(length);
	napi_get_value_string_utf8(env, value, &out[0], length + 1, &length);
	return true;
}

bool GetNumber(napi_env env, napi_value object, const char* key, double& out) {
	bool has = false;
	napi_value value;
	if (napi_has_named_property(env, object, key, &has) != napi_ok || !has || napi_get_named_property(env, object, key, &value) != napi_ok) {
		return false;
	}
	napi_valuetype type;
	napi_typeof(env, value, &type);
	return type == napi_number && napi_get_value_double(env, value, &out) == napi_ok;
}

bool GetBool(napi_env env, napi_value object, const char* key, bool& out) {
	bool has = false;
	napi_value value;
	if (napi_has_named_property(env, object, key, &has) != napi_ok || !has || napi_get_named_property(env, object, key, &value) != napi_ok) {
		return false;
	}
	napi_valuetype type;
	napi_typeof(env, value, &type);
	return type == napi_boolean && napi_get_value_bool(env, value, &out) == napi_ok;
}

// Parses `#RRGGBB` or `#RRGGBBAA` (the format `Color.Format.CSS.formatHexA` writes).
NSColor* ColorFromHex(const std::string& input) {
	std::string hex = input;
	if (!hex.empty() && hex[0] == '#') {
		hex = hex.substr(1);
	}
	if (hex.size() != 6 && hex.size() != 8) {
		return nil;
	}
	char* end = nullptr;
	unsigned long value = strtoul(hex.c_str(), &end, 16);
	if (end == nullptr || *end != '\0') {
		return nil;
	}
	CGFloat r, g, b, a;
	if (hex.size() == 6) {
		r = ((value >> 16) & 0xff) / 255.0;
		g = ((value >> 8) & 0xff) / 255.0;
		b = (value & 0xff) / 255.0;
		a = 1.0;
	} else {
		r = ((value >> 24) & 0xff) / 255.0;
		g = ((value >> 16) & 0xff) / 255.0;
		b = ((value >> 8) & 0xff) / 255.0;
		a = (value & 0xff) / 255.0;
	}
	return [NSColor colorWithSRGBRed:r green:g blue:b alpha:a];
}

void ApplyOptions(napi_env env, napi_value options, NSView* view) {
	if (options == nullptr || view == nil) {
		return;
	}
	napi_valuetype type;
	if (napi_typeof(env, options, &type) != napi_ok || type != napi_object) {
		return;
	}
	std::string text;
	double number = 0;
	bool flag = false;
	if (GetBool(env, options, "hidden", flag)) {
		view.hidden = flag;
	}
	if (GetString(env, options, "appearance", text)) {
		view.appearance = text == "light" ? [NSAppearance appearanceNamed:NSAppearanceNameAqua]
			: text == "dark" ? [NSAppearance appearanceNamed:NSAppearanceNameDarkAqua]
			: nil;
	}
#if VSEBCODE_GLASS_SDK
	if (@available(macOS 26.0, *)) {
		NSGlassEffectView* glass = (NSGlassEffectView*)view;
		if (GetString(env, options, "style", text)) {
			glass.style = text == "clear" ? NSGlassEffectViewStyleClear : NSGlassEffectViewStyleRegular;
		}
		if (GetString(env, options, "tintColor", text)) {
			glass.tintColor = text.empty() ? nil : ColorFromHex(text); // an empty string removes the tint; a missing key keeps it
		}
		if (GetNumber(env, options, "cornerRadius", number)) {
			glass.cornerRadius = number;
		}
	}
#endif
}

napi_value Boolean(napi_env env, bool value) {
	napi_value result;
	napi_get_boolean(env, value, &result);
	return result;
}

napi_value Int32(napi_env env, int32_t value) {
	napi_value result;
	napi_create_int32(env, value, &result);
	return result;
}

napi_value IsSupportedCallback(napi_env env, napi_callback_info) {
	return Boolean(env, IsSupported());
}

// attach(handle: Buffer, options?: GlassOptions): number  (-1 when unsupported)
napi_value Attach(napi_env env, napi_callback_info info) {
	size_t argc = 2;
	napi_value argv[2];
	napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
	bool isBuffer = false;
	if (argc < 1 || napi_is_buffer(env, argv[0], &isBuffer) != napi_ok || !isBuffer) {
		napi_throw_type_error(env, nullptr, "attach: expected the Buffer returned by getNativeWindowHandle()");
		return nullptr;
	}
	void* data = nullptr;
	size_t length = 0;
	napi_get_buffer_info(env, argv[0], &data, &length);
	if (length < sizeof(NSView*)) {
		napi_throw_type_error(env, nullptr, "attach: the window handle is too short");
		return nullptr;
	}
	if (!IsSupported()) {
		return Int32(env, -1);
	}
	NSView* root = *reinterpret_cast<NSView* __strong*>(data);
	if (root == nil) {
		napi_throw_error(env, nullptr, "attach: the window handle does not point to a view");
		return nullptr;
	}
	napi_value options = argc >= 2 ? argv[1] : nullptr;
	__block NSView* created = nil;
	dispatch_block_t work = ^{
#if VSEBCODE_GLASS_SDK
		if (@available(macOS 26.0, *)) {
			NSGlassEffectView* glass = [[NSGlassEffectView alloc] initWithFrame:root.bounds];
			glass.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
			glass.cornerRadius = 0;
			[root addSubview:glass positioned:NSWindowBelow relativeTo:nil];
			created = glass;
		}
#endif
	};
	if ([NSThread isMainThread]) {
		work();
	} else {
		dispatch_sync(dispatch_get_main_queue(), work);
	}
	if (created == nil) {
		return Int32(env, -1);
	}
	ApplyOptions(env, options, created);
	int32_t id = g_nextId++;
	g_entries[id] = { created };
	return Int32(env, id);
}

// update(id: number, options: GlassOptions): boolean
napi_value Update(napi_env env, napi_callback_info info) {
	size_t argc = 2;
	napi_value argv[2];
	napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
	int32_t id = -1;
	if (argc < 2 || napi_get_value_int32(env, argv[0], &id) != napi_ok) {
		napi_throw_type_error(env, nullptr, "update: expected (id, options)");
		return nullptr;
	}
	auto it = g_entries.find(id);
	if (it == g_entries.end()) {
		return Boolean(env, false);
	}
	NSView* view = it->second.view;
	if (view == nil) {
		g_entries.erase(it); // the window went away
		return Boolean(env, false);
	}
	ApplyOptions(env, argv[1], view);
	return Boolean(env, true);
}

// detach(id: number): boolean
napi_value Detach(napi_env env, napi_callback_info info) {
	size_t argc = 1;
	napi_value argv[1];
	napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
	int32_t id = -1;
	if (argc < 1 || napi_get_value_int32(env, argv[0], &id) != napi_ok) {
		napi_throw_type_error(env, nullptr, "detach: expected (id)");
		return nullptr;
	}
	auto it = g_entries.find(id);
	if (it == g_entries.end()) {
		return Boolean(env, false);
	}
	NSView* view = it->second.view;
	g_entries.erase(it);
	dispatch_block_t work = ^{ if (view != nil) { [view removeFromSuperview]; } }; // nil once the window is gone
	if ([NSThread isMainThread]) {
		work();
	} else {
		dispatch_sync(dispatch_get_main_queue(), work);
	}
	return Boolean(env, true);
}

napi_value Init(napi_env env, napi_value exports) {
	napi_property_descriptor properties[] = {
		{ "isSupported", nullptr, IsSupportedCallback, nullptr, nullptr, nullptr, napi_default, nullptr },
		{ "attach", nullptr, Attach, nullptr, nullptr, nullptr, napi_default, nullptr },
		{ "update", nullptr, Update, nullptr, nullptr, nullptr, napi_default, nullptr },
		{ "detach", nullptr, Detach, nullptr, nullptr, nullptr, napi_default, nullptr },
	};
	napi_define_properties(env, exports, sizeof(properties) / sizeof(properties[0]), properties);
	return exports;
}

} // namespace

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
