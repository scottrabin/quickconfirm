module Jekyll
	class BindCodeBlock < Liquid::Block

		def initialize tag_name, markup, tokens
			super
			@trigger_id = markup.strip
		end

		def render context
			<<-HTML
<script type="text/javascript">$('##{@trigger_id}').on('click', function(){ #{super} });</script>
#{Liquid::Template.parse("{% highlight javascript %}{% raw %}#{super}{% endraw %}{% endhighlight %}").render context}
HTML
		end
	end
end

Liquid::Template.register_tag('bind_code', Jekyll::BindCodeBlock)
