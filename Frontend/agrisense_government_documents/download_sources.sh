#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$ROOT/central/pm_kisan" "$ROOT/central/pmfby" "$ROOT/central/kcc" "$ROOT/central/pmksy" "$ROOT/central/soil_health_card" "$ROOT/central/agricultural_mechanization" "$ROOT/central/agriculture_infrastructure_fund" "$ROOT/central/rkvy"

# This script uses curl. If a government site blocks automated downloads, open the URL in a browser and save the file manually.
curl -L --fail -o "$ROOT/central/pm_kisan/PM-KISAN_Revised_Operational_Guidelines_2020.pdf" 'https://pmkisan.gov.in/Documents/RevisedPM-KISANOperationalGuidelines%28English%29.pdf' || true
curl -L --fail -o "$ROOT/central/pmfby/PMFBY_Revised_Operational_Guidelines.pdf" 'https://pmfby.gov.in/pdf/Revised_Operational_Guidelines.pdf' || true
curl -L --fail -o "$ROOT/central/pmksy/PMKSY_Guidelines_English.pdf" 'https://pmksy.gov.in/pdflinks/Guidelines_English.pdf' || true
curl -L --fail -o "$ROOT/central/soil_health_card/Soil_Health_Card_FAQ_English.pdf" 'https://soilhealth.dac.gov.in/files/FAQ_Final_English.pdf' || true
curl -L --fail -o "$ROOT/central/agriculture_infrastructure_fund/AIF_Scheme_Guidelines.pdf" 'https://static.investindia.gov.in/s3fs-public/2024-12/finalschemeguidelinesaif.pdf' || true
curl -L --fail -o "$ROOT/central/agricultural_mechanization/SMAM_Revised_Guidelines_2025.pdf" 'https://farmech.dac.gov.in/Content/New_Folder/Revised_SMAM_Guidelines_%282025%29_With_Covering.pdf' || true
curl -L --fail -o "$ROOT/central/kcc/KCC_2025_Budget_QA.pdf" 'https://financialservices.gov.in/beta/sites/default/files/2025-02/budget.pdf' || true
curl -L --fail -o "$ROOT/central/rkvy/RKVY_Guidelines.pdf" 'https://agriwelfare.gov.in/sites/default/files/rkvy_inro.pdf' || true

echo 'Download attempt complete. Check each folder for PDFs; government sites may block automated downloads.'
