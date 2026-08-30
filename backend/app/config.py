from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Environment
    environment: str = "development"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/college_rag"

    # Gemini
    gemini_api_key: str = ""
    gemini_embedding_model: str = "models/text-embedding-004"
    gemini_chat_model: str = "gemini-1.5-flash"

    # RAG
    vector_dimension: int = 768
    chunk_size: int = 800
    chunk_overlap: int = 150
    top_k: int = 8
    max_context_chunks: int = 5
    similarity_threshold: float = 0.35

    # Storage
    supabase_storage_bucket: str = "documents"
    max_upload_size_mb: int = 25

    # CORS
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
