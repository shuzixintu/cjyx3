from setuptools import setup, find_packages

setup(
    name="cjyx3",
    version="0.1.0",
    description="A simple Python utility project",
    author="shuzixintu",
    packages=find_packages(),
    install_requires=[],
    extras_require={
        "dev": ["pytest>=7.0.0"],
    },
    python_requires=">=3.7",
)
