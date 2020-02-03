from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.views.generic import CreateView

from .models import Patient

from django.shortcuts import render, redirect
from django.conf import settings

    
class PatientCreateView(CreateView):
    model = Patient
    template_name =  'json_form.html'
    fields = ('name', 'email')
