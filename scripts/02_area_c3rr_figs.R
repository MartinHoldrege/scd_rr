# Purpose: Visualize the area in each combination of current and projected
# SEI class and R&R class

# Author: Martin Holdrege

# Script started: December 9, 2024


# dependencies ------------------------------------------------------------

library(tidyverse)
source('src/dataframes.R')
source('src/fig_functions.R')
source('src/fig_params.R')
theme_set(theme_custom1())


# params ------------------------------------------------------------------

assumption <- 'Default'

# read in data ------------------------------------------------------------

# areas calcualted in scripts/01_area_c3rr.js
area1 <- read_csv('data_processed/area/area_c3rr_historical_future_v1.csv',
                  show_col_types = FALSE)

# prepare data ------------------------------------------------------------

area2 <- area1 %>% 
  select(-`system:index`, -`.geo`) %>% 
  filter(assumption == !!assumption)

area3 <- create_c3_rr_cols(area2) %>% # add factor columns
  mutate(variableRR = rrcat2factor(variableRR))


# create summaries --------------------------------------------------------

# future area by c3Rr grouping
area_fut1 <- area3 %>% 
  group_by(assumption, scenario, summary, variableRR, c3_fut, RR_fut, c3Rr_fut) %>% 
  summarize(area_ha = sum(area_ha),
            .groups = 'drop')

# agreement on median class change between RR and SEI class changes
c3Rr_change <- area3 %>% 
  filter(scenario != 'historical',
         summary == 'median') %>% 
  mutate(c3Rr_change = c3Rr_class_change(c3_hist = c3_hist,
                                         c3_fut = c3_fut,
                                         RR_hist = RR_hist,
                                         RR_fut = RR_fut)) %>% 
  group_by(assumption, scenario, summary, variableRR, c3Rr_change) %>% 
  summarize(area_ha = sum(area_ha))

#
c3hist_RRfut <- area3 %>% 
  group_by(assumption, scenario, summary, variableRR, c3_hist, RR_fut) %>%
  summarise(area_ha = sum(area_ha),
            .groups = 'drop_last') %>% 
  # percent of the C3 class that RR class makes up
  mutate(percent_c3 = area_ha/sum(area_ha)*100) %>% 
  ungroup()

c3fut_RRhist <- area3 %>% 
  group_by(assumption, scenario, summary, variableRR, RR_hist, c3_fut) %>%
  summarise(area_ha = sum(area_ha),
            .groups = 'drop_last') %>% 
  # percent of the RR class that RR class makes up (in the future)
  mutate(percent_RR = area_ha/sum(area_ha)*100) %>% 
  ungroup()
           

# fig funs --------------------------------------------------------------


base1 <- function() {
  list(
    labs(y = 'Area (ha)',
         caption = 'Area calculated based on predicted median SEI and RR classes across GCMs')
  )
}
  
# figures ----------------------------------------------------------

cap0 <- paste('\nBased on SCD projections using', assumption, 'STEPWAT assumptions\n')

# future c3/RR classes ----------------------------------------------------


cap1 <- paste('Future (projected) SEI and RR classes are shown.', cap0)
gf1  <- function(variableRR) {
  ggplot(area_fut1[area_fut1$variableRR == variableRR,]) +
    geom_bar(aes(c3_fut, area_ha, fill = RR_fut),
             stat = "identity", position = 'dodge') +
    facet_wrap(~scenario) +
    rotate_x() + 
    fill_rr(name = variableRR) +
    base1() +
    labs(x = 'SEI class',
         caption = cap1)
}



pdf('figures/area/c3rr_fut_area-by-scenario_v1.pdf',
    height = 7, width = 8)
gf1('Resilience')
gf1('Resistance')


g <- ggplot(area_fut1, 
       aes(scenario, area_ha, fill = variableRR)) +
  geom_bar(stat = "identity", position = 'dodge') +
  rotate_x() +
  base1() +
  theme(legend.title = element_blank()) +
  labs(caption = cap1)
g + facet_grid(c3_fut~RR_fut)
g + facet_grid(c3_fut~RR_fut, scales = 'free_y')

dev.off()


# C3Rr class change -------------------------------------------------------

pdf('figures/area/c3rr_class-change_v1.pdf',
    height = 7, width = 8)
ggplot(c3Rr_change, aes(c3Rr_change, area_ha, fill = scenario)) +
  geom_bar(stat = "identity", position = 'dodge') +
  facet_wrap(~variableRR) +
  rotate_x() +
  labs(x = 'SEI and RR class change',
       y = lab_areaha,
       caption = paste('Median change in class, relative to historical class',
                       cap0))
dev.off()


# change within historical categories -------------------------------------

base2 <- function(){
  list(geom_bar(stat = 'identity'),
       rotate_x(),
       labs(x = NULL,
            caption = paste('Using median projected class', cap0))
  )
}

pdf('figures/area/c3rr_percent-historical_v1.pdf',
    height = 7, width = 8)
# percent of historical C3 (RR) class area that falls into a given 
# RR (c3) class in the future
ggplot(c3hist_RRfut, aes(x = scenario, y = percent_c3,
                         fill = RR_fut)) +
  base2() +
  facet_grid(variableRR~c3_hist) +
  labs(y = '% of area of historic SEI class') +
  fill_rr(name = 'Projected R&R class')

ggplot(c3fut_RRhist, aes(x = scenario, y = percent_RR,
                         fill = c3_fut)) +
  base2() +
  facet_grid(variableRR~RR_hist) +
  labs(y = '% of area of historic R&R class') +
  scale_fill_manual(values = cols_c3,
                    name = 'Projected SEI class')

dev.off()
