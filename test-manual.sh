#!/bin/bash
# Manual test script for Bible Course App

echo "========================================="
echo "  Bible Course App - Manual Test"
echo "========================================="
echo ""

# Test 1: Validate lessons
echo "✓ Test 1: Validating all lessons..."
npm run validate-lessons 2>&1 | grep -E "valid|error" | head -3
echo ""

# Test 2: Run a simple session with a few commands
echo "✓ Test 2: Running interactive session with sample commands..."
(printf "start\nnext\nrepeat\nexit\n" | npm run session 2>&1) | grep -E "✓ Command:|State:" | head -10
echo ""

# Test 3: Check audio commands
echo "✓ Test 3: Testing audio commands..."
(printf "start\nplay\npause-audio\nresume-audio\nstop-audio\nexit\n" | npm run session:audio 2>&1) | grep -E "♫|Audio|Command" | head -10
echo ""

echo "========================================="
echo "  All tests completed!"
echo "========================================="
