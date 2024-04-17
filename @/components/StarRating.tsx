import { StarIcon } from "lucide-react"
import React from "react"

// Assuming StarIcon is imported from your project structure

const StarRating = ({ rating }: { rating: number }) => {
  // Total number of stars
  const totalStars = 5

  // Create an array from 0 to totalStars and map it to star icons
  const stars = Array.from({ length: totalStars }, (_, index) => {
    return (
      <StarIcon
        key={index}
        className={index < rating ? "fill-yellow-400" : ""}
        color="#facc15"
      />
    )
  })

  return <div className="flex items-center gap-1">{stars}</div>
}

export default StarRating
