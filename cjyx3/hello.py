"""
Simple greeting module for cjyx3
"""


def greet(name: str) -> str:
    """
    Generate a greeting message.
    
    Args:
        name: The name to greet
        
    Returns:
        A greeting message string
        
    Example:
        >>> greet("World")
        'Hello, World!'
    """
    return f"Hello, {name}!"


def main():
    """Main entry point for the greeting functionality."""
    message = greet("World")
    print(message)


if __name__ == "__main__":
    main()
