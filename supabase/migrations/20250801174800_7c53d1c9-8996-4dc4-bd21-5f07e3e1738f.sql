-- Grant admin role to johnduy.it@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'johnduy.it@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add reading_time column to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5;

-- Create saved_posts table for bookmarking
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on saved_posts
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_posts
CREATE POLICY "Users can view their own saved posts" 
ON saved_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON saved_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
ON saved_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Insert sample blog posts
INSERT INTO posts (title, content, excerpt, author_id, published, reading_time, tags) VALUES
(
  'Mastering Modern Web Development: A Complete Guide',
  '# The Evolution of Web Development

In the rapidly evolving world of technology, web development has undergone tremendous transformation. From simple static HTML pages to complex, interactive applications, the journey has been remarkable.

## The Foundation: HTML, CSS, and JavaScript

Every great web developer starts with the fundamentals. HTML provides structure, CSS brings style and visual appeal, while JavaScript adds interactivity and dynamic behavior.

### Modern Framework Revolution

Today''s development landscape is dominated by powerful frameworks like React, Vue, and Angular. These tools have revolutionized how we build user interfaces, making them more component-based and maintainable.

```javascript
const WelcomeComponent = () => {
  return (
    <div className="welcome">
      <h1>Welcome to Modern Web Development</h1>
    </div>
  );
};
```

## Best Practices for Success

1. **Write Clean, Readable Code**: Your future self will thank you
2. **Test Everything**: Automated testing saves countless hours
3. **Performance Matters**: Users expect fast-loading applications
4. **Accessibility First**: Build for everyone, not just some
5. **Stay Updated**: Technology evolves rapidly

## The Future is Bright

Web development continues to evolve with new technologies like WebAssembly, Progressive Web Apps, and AI integration. The key to success is continuous learning and adaptation.

Remember: Great developers are made through practice, persistence, and passion for solving problems.',
  'Explore the fundamentals and advanced concepts of modern web development, from HTML basics to cutting-edge frameworks and best practices.',
  (SELECT id FROM profiles WHERE full_name LIKE '%John%' LIMIT 1),
  true,
  8,
  ARRAY['web development', 'programming', 'javascript', 'react', 'best practices']
),
(
  'The Art of User Experience Design: Creating Meaningful Digital Interactions',
  '# Understanding User Experience Design

User Experience (UX) design is more than just making things look pretty. It''s about creating meaningful, efficient, and enjoyable interactions between users and digital products.

## What Makes Great UX?

Great user experience design is invisible. When users can accomplish their goals without friction, confusion, or frustration, that''s when you know you''ve succeeded.

### The Five Elements of UX

1. **Strategy**: Understanding business goals and user needs
2. **Scope**: Defining functional requirements and content
3. **Structure**: Information architecture and interaction design
4. **Skeleton**: Interface design and navigation
5. **Surface**: Visual design and brand expression

## Research is Everything

Before designing anything, understand your users:

- **User Interviews**: Direct conversations reveal true needs
- **Analytics**: Data tells the story of user behavior
- **Usability Testing**: Watch real people use your product
- **Surveys**: Gather quantitative insights at scale

## Design Principles That Matter

### Simplicity Over Complexity
> "Simplicity is the ultimate sophistication" - Leonardo da Vinci

Every element should have a purpose. Remove anything that doesn''t serve the user''s goals.

### Consistency Builds Trust
Users should never have to learn new patterns within your product. Establish design systems and stick to them.

### Feedback is Essential
Users need to know their actions have consequences. Provide clear, immediate feedback for every interaction.

## Tools of the Trade

Modern UX designers have powerful tools at their disposal:

- **Figma**: Collaborative design and prototyping
- **Adobe XD**: End-to-end UX design platform
- **Sketch**: Vector-based design tool
- **InVision**: Prototyping and collaboration
- **Miro**: Ideation and user journey mapping

## The Mobile-First Approach

With mobile traffic dominating the web, designing for mobile-first isn''t optional—it''s essential. Start with the constraints of small screens and expand upward.

## Accessibility: Design for Everyone

Inclusive design isn''t just morally right; it''s good business. Consider:

- Color contrast for visual impairments
- Keyboard navigation for motor disabilities
- Screen reader compatibility for blind users
- Clear language for cognitive accessibility

## Measuring Success

UX design success isn''t subjective. Track metrics like:

- Task completion rates
- Time to complete tasks
- Error rates
- User satisfaction scores
- Conversion rates

## The Future of UX

Emerging technologies are reshaping how we think about user experience:

- **Voice Interfaces**: Designing for conversation
- **AR/VR**: Spatial interaction design
- **AI/ML**: Personalized, adaptive interfaces
- **IoT**: Connected device ecosystems

## Conclusion

Great UX design is a continuous process of understanding, designing, testing, and iterating. It requires empathy, creativity, and analytical thinking.

The most successful digital products are those that put users at the center of every decision. By focusing on solving real problems and creating delightful experiences, we can build products that truly matter.',
  'Dive deep into the principles and practices of user experience design, from research methodologies to design systems and emerging technologies.',
  (SELECT id FROM profiles WHERE full_name LIKE '%John%' LIMIT 1),
  true,
  12,
  ARRAY['ux design', 'user experience', 'design thinking', 'digital design', 'accessibility']
);