# Quick Reference: TypeScript & Tailwind CSS

## 🎯 TypeScript Cheat Sheet

### Basic Types
```typescript
const name: string = "John";
const age: number = 25;
const isActive: boolean = true;
const items: string[] = ["a", "b"];
```

### Interfaces
```typescript
interface User {
  name: string;
  age: number;
  email?: string;  // Optional
}
```

### React Hooks
```typescript
// State
const [count, setCount] = useState<number>(0);
const [items, setItems] = useState<string[]>([]);

// Effect
useEffect(() => {
  // Run code here
}, []); // Empty = run once
```

### Component Props
```typescript
function Button({ text, onClick }: { text: string; onClick: () => void }) {
  return <button onClick={onClick}>{text}</button>;
}
```

---

## 🎨 Tailwind CSS Cheat Sheet

### Colors
```typescript
bg-blue-500    // Background
text-gray-800  // Text color
border-red-300 // Border color
```

### Spacing
```typescript
p-4    // Padding all: 1rem
px-6   // Padding horizontal: 1.5rem
py-3   // Padding vertical: 0.75rem
m-4    // Margin all
mb-8   // Margin bottom: 2rem
gap-4  // Gap between items
```

### Layout
```typescript
flex              // Flexbox
flex-col          // Column direction
items-center      // Center items
justify-between   // Space between
grid              // Grid
grid-cols-3       // 3 columns
w-full            // Full width
h-screen          // Full height
```

### Typography
```typescript
text-4xl          // 36px
text-2xl          // 24px
font-bold         // Bold
text-center       // Center align
```

### Responsive
```typescript
md:text-xl        // Medium screens (768px+)
lg:grid-cols-3    // Large screens (1024px+)
```

### Effects
```typescript
rounded-lg        // Rounded corners
shadow-md         // Shadow
hover:bg-blue-600 // Hover effect
transition        // Smooth animation
```

---

## 📝 Common Patterns

### Conditional Rendering
```typescript
{isLoading ? (
  <div>Loading...</div>
) : (
  <div>Content</div>
)}
```

### Mapping Arrays
```typescript
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

### Template Literals
```typescript
const className = `bg-${color}-500`;  // Dynamic class
```

---

## 🚀 Next Steps

1. **Read the tutorial**: `TYPESCRIPT_AND_TAILWIND_TUTORIAL.md`
2. **Study the code**: Look at `app/page.tsx` with all the comments
3. **Experiment**: Try changing colors, spacing, layout
4. **Practice**: Build other pages using these concepts

---

## 💡 Pro Tips

1. **TypeScript catches errors** - If you see red underlines, fix them!
2. **Tailwind is mobile-first** - Base styles = mobile, add `md:`, `lg:` for larger screens
3. **Use interfaces** - Define data shapes once, reuse everywhere
4. **Component organization** - Break UI into smaller components
5. **Read the docs** - Tailwind docs are excellent: https://tailwindcss.com/docs



