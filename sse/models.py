from __future__ import unicode_literals
from django.db import models
from django import forms


#Create your models here.
class Patient(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
   # age = models.IntegerField()