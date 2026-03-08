FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /code/

COPY pyproject.toml uv.lock /code/

RUN uv sync --no-cache --no-dev

COPY ./backend/ /code/backend/

CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]

