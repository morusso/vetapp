-- Runs once on first start of the postgres container, inside the
-- database created via POSTGRES_DB (vetapp).
-- Creates a dedicated schema for the application and makes it the
-- default for the application role.

CREATE SCHEMA IF NOT EXISTS vetapp AUTHORIZATION vetapp;

ALTER ROLE vetapp SET search_path TO vetapp, public;
