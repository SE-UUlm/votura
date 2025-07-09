FROM postgres:17.4

# Install pg_cron and required packages
RUN apt-get update && \
    apt-get install -y postgresql-17-cron && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add pg_cron to shared_preload_libraries
RUN echo "shared_preload_libraries = 'pg_cron'" >> /usr/share/postgresql/postgresql.conf.sample
RUN echo "cron.database_name = 'votura'" >> /usr/share/postgresql/postgresql.conf.sample
