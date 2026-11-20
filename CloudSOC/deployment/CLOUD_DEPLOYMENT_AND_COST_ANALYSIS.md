# CloudSOC Cloud Deployment Strategy & Cost Analysis (Approval Required Before Provisioning)

## 1. Multi-Cloud Provider Evaluation
| Criterion | Google Cloud (Cloud Run + Cloud SQL) | AWS (ECS/App Runner + RDS) | Azure (App Service + Azure PostgreSQL) |
|---|---|---|---|
| Free-Tier Eligibility | Cloud Run: 2M requests/mo free; Cloud SQL Developer/Micro has ongoing hourly cost | App Runner has no always-free compute; RDS free tier expires after 12 months | App Service F1 free (no custom TLS); PostgreSQL Flexible Server free 12 months |
| Managed PostgreSQL | Cloud SQL for PostgreSQL | Amazon RDS for PostgreSQL | Azure Database for PostgreSQL |
| HTTPS & TLS | Automatic managed TLS on `*.run.app` | Automatic on App Runner / ALB | Automatic on `*.azurewebsites.net` |
| Secrets Management | Secret Manager | AWS Secrets Manager | Azure Key Vault |
| Ease of Container Deployment | Single `gcloud run deploy` | Moderate (ECR + ECS/App Runner) | Moderate (ACR + Web App) |

**Selected Primary Cloud Provider:** **Google Cloud Platform (Cloud Run)** paired with either managed PostgreSQL (Cloud SQL, chargeable) or a **free-tier alternative** (Neon/Supabase/Render free PostgreSQL) depending on user financial approval.

## 2. Services Requiring Explicit User Financial Approval
Per the Strict Cloud Cost and Approval Policy, no paid resources have been provisioned yet:
1. **Google Cloud Run (`cloudsoc-service`)**:
   - **Purpose**: Serverless HTTPS container hosting with scale-to-zero (`min-instances=0`, `max-instances=3`).
   - **Estimated Cost**: $0.00/month within Always Free tier (first 2M requests, 360k vCPU-sec, 180k GiB-sec/month); ~$0.000024/vCPU-sec above free tier.
   - **Additional Charges**: Artifact Registry storage (~$0.10/GB/month beyond 0.5 GB) and Cloud Build minutes beyond 120 free min/day.
2. **Google Cloud SQL for PostgreSQL (`db-f1-micro` / Developer Edition)**:
   - **Purpose**: Managed relational PostgreSQL persistence with automated backups and IAM/TLS encryption.
   - **Estimated Cost**: ~$7.67–$15.00/month (not Always Free).
   - **Free Alternative**: Render Free PostgreSQL (90-day free tier), Neon Free Tier (0.5 GB PostgreSQL), or Supabase Free Tier ($0/month), or AI Studio's hosted preview container with persistent disk during evaluation.

## 3. Exact Steps Once Approved
1. User confirms preferred hosting/database budget (Google Cloud Run + Cloud SQL vs. Free-tier PostgreSQL).
2. Run `gcloud run deploy` using `deployment/cloudbuild.yaml` and inject `DATABASE_URL` + `SESSION_SECRET` via Cloud Secret Manager.
3. Apply `migrations/001_initial_postgresql.sql`.
4. Verify live HTTPS URL, login, event ingestion, alert generation, and persistence across container restarts.
