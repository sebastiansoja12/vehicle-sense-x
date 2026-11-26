FROM node:24.18.0-bookworm-slim

ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
WORKDIR /app
COPY --chown=node:node index.mjs ./
USER node
EXPOSE 8787
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "--input-type=module", "-e", "const r = await fetch('http://127.0.0.1:' + process.env.PORT + '/health', { signal: AbortSignal.timeout(2000) }); if (!r.ok) process.exitCode = 1;"]
CMD ["node", "index.mjs"]
