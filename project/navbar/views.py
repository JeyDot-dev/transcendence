from django.shortcuts import render
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.template import RequestContext


def index(request):
    context = {"request": request}
    updated_content = render_to_string(
        "navbar/index.html", context=context, request=request
    )
    return JsonResponse({"content": updated_content})


# Create your views here.
