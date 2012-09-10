deploy_dir = '_deploy'
build_dir  = '_site'

task :deploy do |t|
	# clear out the old files from the deploy subdirectory
	Dir["./#{deploy_dir}/*"].each { |dir|
		rm_rf dir
	}
	# regenerate the site
	system "jekyll"
	# copy over the built site files
	cp_r "#{build_dir}/.", deploy_dir
	# submodules
	cd deploy_dir do
		system "git submodule init && git submodule update"
		system "git add . && git add -u && git commit"
	end
end
