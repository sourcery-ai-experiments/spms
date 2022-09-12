from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in spms/__init__.py
from spms import __version__ as version

setup(
	name="spms",
	version=version,
	description="Sales Person Management System",
	author="aoai",
	author_email="info@aoai.io",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
