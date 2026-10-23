import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const zh = readFileSync(new URL("../src/pages/tools/lifespan-calculator.astro", import.meta.url), "utf8");
const en = readFileSync(new URL("../src/pages/en/tools/lifespan-calculator.astro", import.meta.url), "utf8");

test("both versions offer matching optional context topics", () => {
  for (const name of ["spayed", "regular-vet", "overweight"]) {
    assert.ok(zh.includes(`id="${name}"`), `Chinese missing ${name}`);
  }
  for (const name of ["neutered", "regularVet", "overweight"]) {
    assert.ok(en.includes(`id="${name}"`), `English missing ${name}`);
  }
  assert.doesNotMatch(zh, /id="spayed"\s+checked/);
});

test("both versions use the shared age and lifespan model", () => {
  for (const page of [zh, en]) {
    assert.match(page, /from [\x27\x22]\.\.\/.*utils\/agingModel[\x27\x22]/);
    assert.match(page, /estimateLifespanRange\(.*?,\s*.*?\)/);
    assert.match(page, /getCatLifeStage/);
    assert.match(page, /getDogLifeStage/);
  }
});

test("neither page describes numeric output as an individual forecast", () => {
  assert.match(zh, /不是剩餘壽命預測/);
  assert.match(en, /not an individual forecast/);
  assert.doesNotMatch(zh, /預估終點|健康狀況估算剩餘壽命/);
  assert.doesNotMatch(en, /Estimated lifespan/);
});

test("optional context controls do not change the lifespan lookup inputs", () => {
  // Guard the call sites against accidentally feeding checkboxes into the numeric model.
  assert.match(zh, /estimateLifespanRange\(petType,\s*category as /);
  assert.match(en, /estimateLifespanRange\(species,\s*sizeKey as /);
  assert.match(zh, /選項僅用於提供與獸醫討論的背景提示/);
  assert.match(en, /selections only change the explanatory notes/);
});

test("context note background classes are discoverable at build time", () => {
  assert.match(zh, /bg-green-50/);
  assert.match(zh, /bg-blue-50/);
  assert.doesNotMatch(zh, /bg-\$\{/);
});
