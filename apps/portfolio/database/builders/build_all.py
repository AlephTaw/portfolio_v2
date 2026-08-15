"""Rebuild every registered canonical MLPHD SQLite database."""

from . import DATABASE_BUILDERS


def main() -> None:
    databases = [builder() for builder in DATABASE_BUILDERS.values()]
    print(f"Built {len(databases)} canonical SQLite databases.")


if __name__ == "__main__":
    main()
