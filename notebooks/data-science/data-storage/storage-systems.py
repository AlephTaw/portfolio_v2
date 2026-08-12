import marimo

__generated_with = "0.19.7"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp.theme import lesson_style

    lesson_style()
    return (mo,)


@app.cell
def _(mo):
    mo.md(
        r"""
        # Storage Systems by Access Pattern

        Cloud storage includes object storage, block storage, file storage, and data lakes
        or warehouses. View them as a hierarchy that scales from raw hardware blocks to
        structured business data. Each layer serves a specific access pattern, speed
        requirement, and consistency model.

        ## Physical and Infrastructure Layer

        This layer deals with bytes, disks, and raw access.

        - **Block Storage:** Raw volumes attached to servers. It offers low latency and high
          IOPS. Use it for operating-system boot disks and high-performance databases.
        - **File Storage:** Hierarchical folders shared over a network through protocols such
          as NFS or SMB. Use it for shared home directories and legacy application content.

        ## Unstructured and Blob Layer

        This layer stores raw files without a fixed database schema.

        - **Object Storage:** A flat namespace for large binary objects. Use it for images,
          backups, media, and data-lake raw zones.

        ## Analytical and Big Data Layer

        This layer organizes large datasets for search and analytics.

        - **Data Lakes:** Repositories for raw, semi-structured, and structured files used in
          large-scale processing and machine-learning training.
        - **Data Warehouses:** Columnar relational storage optimized for analytical queries
          and aggregated reporting.

        ## Operational and Transactional Layer

        This layer manages live, mutable application state.

        - **Relational Databases:** Tables with schemas and transactional guarantees.
        - **NoSQL Databases:** Models optimized for access patterns such as key-value,
          document, or graph retrieval.

        ## Ephemeral and Cache Layer

        This layer trades durability for speed.

        - **In-Memory Caches:** Volatile storage for sessions, query results, and
          low-latency retrieval.
        """
    )
    return


if __name__ == "__main__":
    app.run()
