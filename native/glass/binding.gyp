{
	"targets": [
		{
			"target_name": "vsebcode_glass",
			"conditions": [
				["OS=='mac'", {
					"sources": ["src/glass.mm"],
					"xcode_settings": {
						"CLANG_CXX_LANGUAGE_STANDARD": "c++17",
						"CLANG_CXX_LIBRARY": "libc++",
						"CLANG_ENABLE_OBJC_ARC": "YES",
						"MACOSX_DEPLOYMENT_TARGET": "12.0",
						"OTHER_LDFLAGS": ["-framework AppKit", "-framework QuartzCore"]
					}
				}, {
					"type": "none"
				}]
			]
		}
	]
}
