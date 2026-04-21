FROM nginx:stable-alpine

# Copy the base config with PAYFILE_DOMAIN placeholder
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Startup script: replace PAYFILE_DOMAIN with the actual value and launch nginx
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["/start.sh"]
