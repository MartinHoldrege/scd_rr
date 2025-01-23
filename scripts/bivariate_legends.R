# create bivariate color grids, that show the colors
# of combinations of RR and SEI class

# Author: Martin Holdrege

# script started Jan 22, 2025


# dependencies ------------------------------------------------------------

library('biscale')
library(ggplot2)


# vectors -----------------------------------------------------------------


xylabs1 <- list(
  bi_x = c('CSA', 'GOA', 'ORA'),
  bi_y = c('L', "LM", "M+H")
)

BlueOr1 <- bi_pal('BlueOr', preview = FALSE)

BlueOr2 <- BlueOr1[c(7, 4, 1, 8, 5, 2, 9, 6, 3)] # rotate colors 90 degrees to the left
names(BlueOr2) <- names(BlueOr1)

# this is the order the colors are used in GEE
# BlueOr2[c(7, 4, 1, 8, 5, 2, 9, 6, 3)] 

# create bivariate legends ------------------------------------------------


g <- biscale::bi_legend(BlueOr2,
                   dim = 3,
                   xlab = 'Future SEI class',
                   ylab = 'Future R&R',
                   rotate_pal = FALSE,
                   breaks = xylabs1,
                   arrows = FALSE) 


g2 <- g + 
  scale_x_continuous(
    position = "top",
    breaks = 1:3,                    # Set the positions of the ticks
    labels = xylabs1$bi_x            # Set the labels for the ticks
  )


ggsave('figures/bivariate_legends/bivariate_blueOr_v1.png', g2,
       width = 3, height = 3)
