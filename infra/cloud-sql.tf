resource "google_sql_database_instance" "meal_planner" {
  database_version    = "POSTGRES_18"
  instance_type       = "CLOUD_SQL_INSTANCE"
  maintenance_version = "POSTGRES_18_2.R20260108.01_14"
  name                = "meal-planner"
  project             = var.project_id
  region              = var.region

  settings {
    activation_policy = "ALWAYS"
    availability_type = "ZONAL"
    retain_backups_on_delete = true

    backup_configuration {
      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }

      enabled                        = true
      location                       = "asia"
      point_in_time_recovery_enabled = true
      start_time                     = "18:00"
      transaction_log_retention_days = 7
    }

    connector_enforcement = "NOT_REQUIRED"

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }

    deletion_protection_enabled = true
    disk_autoresize             = true
    disk_autoresize_limit       = 0
    disk_size                   = 100
    disk_type                   = "PD_SSD"
    edition                     = "ENTERPRISE"

    ip_configuration {
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }

      ipv4_enabled = true
    }

    location_preference {
      zone = "asia-southeast1-a"
    }

    maintenance_window {
      update_track = "canary"
    }

    password_validation_policy {
      complexity                  = "COMPLEXITY_DEFAULT"
      disallow_username_substring = true
      enable_password_policy      = true
      min_length                  = 8
    }

    pricing_plan = "PER_USE"
    tier         = "db-f1-micro"
  }
}
