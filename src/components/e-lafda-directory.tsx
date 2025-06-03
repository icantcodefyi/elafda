"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { SearchContainer } from "~/components/search"
import { Star, Clock, User, Eye } from "lucide-react"

// Mock data for e-lafdas - you can replace this with real data
const mockELafdas = [
  {
    id: "1",
    title: "The Great Debate of 2024",
    description: "A heated discussion about the future of web development frameworks",
    author: "TechGuru42",
    createdAt: "2024-01-15",
    views: 1250,
    stars: 89,
    category: "Technology",
    isHot: true,
  },
  {
    id: "2",
    title: "Coffee vs Tea: The Ultimate Lafda",
    description: "Which beverage reigns supreme? The community speaks out!",
    author: "CaffeineAddict",
    createdAt: "2024-01-10",
    views: 856,
    stars: 42,
    category: "Lifestyle",
    isHot: false,
  },
  {
    id: "3",
    title: "Remote Work Productivity Hacks",
    description: "Controversial opinions about working from home that sparked major discussion",
    author: "WorkFromHomeWizard",
    createdAt: "2024-01-08",
    views: 2341,
    stars: 156,
    category: "Career",
    isHot: true,
  },
  {
    id: "4",
    title: "The Pineapple Pizza Controversy",
    description: "Does pineapple belong on pizza? This lafda divided the internet",
    author: "FoodCritic99",
    createdAt: "2024-01-05",
    views: 1789,
    stars: 73,
    category: "Food",
    isHot: false,
  },
]

interface ELafdaDirectoryProps {
  className?: string
}

export function ELafdaDirectory({ className }: ELafdaDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const availableCategories = useMemo(() => {
    return Array.from(new Set(mockELafdas.map(lafda => lafda.category)))
  }, [])

  const filteredAndSortedELafdas = useMemo(() => {
    const filtered = mockELafdas.filter((lafda) => {
      // Search term filter
      const matchesSearch = lafda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lafda.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lafda.author.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [searchTerm])

  return (
    <div className={className}>
      {/* Search and Filters Section */}
      <SearchContainer
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search e-lafdas by title, description, or author..."
        resultsCount={filteredAndSortedELafdas.length}
        totalCount={mockELafdas.length}
        className="mb-6"
      />

      {/* E-Lafdas Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAndSortedELafdas.map((lafda) => (
          <Card key={lafda.id} className="group hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/e-lafda/${lafda.id}`} className="hover:underline">
                      {lafda.title}
                    </Link>
                    {lafda.isHot && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                         Hot
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-3">
                    {lafda.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Author and Date */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{lafda.author}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(lafda.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{lafda.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      <span>{lafda.stars}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {lafda.category}
                  </span>
                </div>

                {/* Action Button */}
                <Link href={`/e-lafda/${lafda.id}`}>
                  <Button className="w-full" variant="outline">
                    View Discussion
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedELafdas.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No e-lafdas found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
        </div>
      )}

      {/* Load More Section */}
      {filteredAndSortedELafdas.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More E-Lafdas
          </Button>
        </div>
      )}
    </div>
  )
} 