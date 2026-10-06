-- ===========================================================================
-- Migration 003 - garment/material editorial copy and image galleries
-- Apply to an EXISTING database. Safe to run more than once.
-- ===========================================================================

alter table tibeb_patterns add column if not exists story text;
alter table tibeb_patterns add column if not exists image_urls text[] default '{}';

update tibeb_patterns
set image_urls = array[image_url]
where image_url is not null
  and coalesce(cardinality(image_urls), 0) = 0;