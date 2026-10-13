#!/bin/bash
echo "🔧 AR Vance Routing Fix Started..."

# Remove ALL duplicate route files
echo "❌ Removing: app/blog/page.tsx"
rm -f app/blog/page.tsx

echo "❌ Removing: app/services/page.tsx"  
rm -f app/services/page.tsx

echo "❌ Removing: app/dashboard/page.tsx"
rm -f app/dashboard/page.tsx

echo "❌ Removing: app/admin/blog/page.tsx"
rm -f app/admin/blog/page.tsx

echo "❌ Removing: app/(public)/page.tsx"
rm -f app/'(public)'/page.tsx

# Remove empty (public) folder if it only had page.tsx
if [ -d "app/(public)" ] && [ -z "$(ls -A app/'(public)'/ 2>/dev/null)" ]; then
  echo "🧹 Removing empty (public) folder"
  rmdir app/'(public)' 2>/dev/null || true
fi

echo "✅ Routing conflicts fixed!"
echo "✅ All duplicate routes removed"
