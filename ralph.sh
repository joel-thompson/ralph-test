#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

total_input=0
total_output=0
total_cache_read=0
total_cost=0

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "--------------------------------"
  
  result=$(claude -p "$(cat PROMPT.md)" --output-format json 2>&1) || true

  # Parse JSON response
  text_response=$(echo "$result" | jq -r '.result // empty')
  input_tokens=$(echo "$result" | jq -r '.usage.input_tokens // 0')
  output_tokens=$(echo "$result" | jq -r '.usage.output_tokens // 0')
  cache_read=$(echo "$result" | jq -r '.usage.cache_read_input_tokens // 0')
  cost=$(echo "$result" | jq -r '.total_cost_usd // 0')
  
  total_input=$((total_input + input_tokens))
  total_output=$((total_output + output_tokens))
  total_cache_read=$((total_cache_read + cache_read))
  total_cost=$(echo "$total_cost + $cost" | bc)

  echo "$text_response"
  echo ""
  echo "This iteration: ${input_tokens} in / ${output_tokens} out / ${cache_read} cached | \$${cost}"
  echo "Cumulative: ${total_input} in / ${total_output} out / ${total_cache_read} cached | \$${total_cost}"

  if [[ "$text_response" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "✓ All tasks complete after $i iterations."
    echo "Total: ${total_input} input, ${total_output} output, ${total_cache_read} cache read"
    echo "Total cost: \$${total_cost}"
    exit 0
  fi
  
  echo "--- End of iteration $i ---"
  echo ""
done

echo "Reached max iterations ($1)"
echo "Total: ${total_input} input, ${total_output} output, ${total_cache_read} cache read"
echo "Total cost: \$${total_cost}"
exit 1