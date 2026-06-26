---
title: "BFTools: Brainfuck language tools"
slug: "bftools"
cover: "/work/bftools-cover.svg"
summary: "A full developer toolchain for Brainfuck: a Cranelift JIT, a language server, a real debugger, a formatter, and an AOT compiler, across seven Rust crates."
role: "Solo developer"
stack: ["Rust", "Cranelift", "tower-lsp (LSP)", "Debug Adapter Protocol", "TypeScript", "VS Code API"]
category: "devtools"
repo: "https://github.com/AnmolS1/BFTools"
liveUrl: "https://marketplace.visualstudio.com/items?itemName=Ponderance.brainfuck-vscode"
featured: false
order: 4
---

A complete dev environment for the most useless language I could find, oddly enough it taught me the most. Seven Rust crates: a shared core (lexer, parser, AST), a tree-walking interpreter with a Cranelift JIT that profiles hot loops and compiles them to native code, an AOT compiler that emits real object files from the same IR, a language server (tower-lsp) for diagnostics and formatting, and a DAP debug adapter for breakpoints and stepping through the memory tape. The VS Code extension is a thin TypeScript client, so all the smarts live behind LSP and DAP and the tooling isn't welded to one editor.
