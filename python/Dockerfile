# syntax=docker/dockerfile:1
FROM python:3.9

WORKDIR /app

COPY . .
RUN pip install -r requirements.txt

RUN addgroup --system mercari && adduser --system --ingroup mercari trainee
RUN chown -R trainee:mercari /app/db
RUN chown -R trainee:mercari /app/images

USER trainee

# CMD ["python3", "-V"]
CMD ["uvicorn", "main:app","--host", "0.0.0.0", "--reload", "--port", "9000"]
