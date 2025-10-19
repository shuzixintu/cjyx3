"""
Tests for the hello module
"""
import pytest
from cjyx3.hello import greet


def test_greet_basic():
    """Test basic greeting functionality"""
    result = greet("World")
    assert result == "Hello, World!"


def test_greet_with_different_name():
    """Test greeting with a different name"""
    result = greet("Alice")
    assert result == "Hello, Alice!"


def test_greet_with_empty_string():
    """Test greeting with an empty string"""
    result = greet("")
    assert result == "Hello, !"


def test_greet_with_chinese():
    """Test greeting with Chinese characters"""
    result = greet("世界")
    assert result == "Hello, 世界!"
