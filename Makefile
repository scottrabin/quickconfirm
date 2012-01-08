FILES = jquery.quickconfirm.js
OUTPUT = jquery.quickconfirm.min.js

all: min

min:
	@@echo "Uploading to Closure Compiler API service..."
	curl --data-urlencode "js_code=`cat ${FILES}`" -d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" http://closure-compiler.appspot.com/compile > ${OUTPUT}
	@@echo "Compiled to ${OUTPUT}"
