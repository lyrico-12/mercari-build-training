# syntax=docker/dockerfile:1
FROM alpine

RUN apk add --no-cache python3 py3-pip

WORKDIR /app
COPY requirements.txt requirements.txt
RUN python3 -m venv /app/venv && \
    . /app/venv/bin/activate && \
    pip install -r requirements.txt

COPY . .

RUN addgroup -S mercari && adduser -S trainee -G mercari
RUN chown -R trainee:mercari /app/db
RUN chown -R trainee:mercari /app/images

USER trainee

# CMD ["python3", "-V"]
CMD ["/app/venv/bin/uvicorn", "main:app","--host", "0.0.0.0", "--reload", "--port", "9000", "--log-level", "info"]
