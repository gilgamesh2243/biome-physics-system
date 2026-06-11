# Biome Physics System

Small TypeScript MVP for simulating flows and state transitions in a controlled biome coupled to compute heat.

This project models water, air humidity, thermal storage, plant transpiration, compute waste heat, and simple control policies. It is a physics-ish flow-balance simulator for research prototyping — not a scientific or production-grade model.

Quick start

```bash
npm install
npm run typecheck
npm test
npm run dev
npm run simulate:compute
npm run compare:policies
```

Limitations

- Deterministic, simplified equations
- No external sensors, no hardware, no UI, no DB
- Not a scientific HVAC or plant-model replacement
