from django.http import HttpResponseRedirect

class FetchOnlyMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response
		self.restricted_paths = [
			'/pong/game/'
		]

	def __call__(self, request):
		request_path = request.path
		if not request_path.endswith('/'):
			request_path += '/'

		if request_path.startswith('/api/') or request_path in self.restricted_paths:
			if request.headers.get('X-Requested-With') != 'XMLHttpRequest':
				return HttpResponseRedirect('/')
		response = self.get_response(request)
		return response
