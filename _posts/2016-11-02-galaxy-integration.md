---
layout: post
title: IOBIO Now in Galaxy
image: /public/images/blog/galaxy.png
subtitle: bam.iobio and vcf.iobio have been integrated into galaxy
tags:
  - Chase Miller
---

bam.iobio and vcf.iobio can now be launched directly from galaxy using your data already stored there.

To give it a spin, you can use a public dataset already in galaxy. Login to [galaxy](https://usegalaxy.org/) and go to the [iobio demo data folder](https://usegalaxy.org/library/list?#folders/Fabe1072935a8f2e4)

<img src="/public/images/blog/galaxy_integration/iobio_public_folder.png"  style="width: 100%; display:block; margin:auto"/>

Then click on each of the two demo data files (bam and vcf) and click To History

<img src="/public/images/blog/galaxy_integration/galaxy_to_history.png"  style="width: 100%; display:block; margin:auto"/>


Now head back to the [galaxy homepage](https://usegalaxy.org/) and you should see your two files in the history panel. Click on  NA12878.autsome.bam and when it expands click on "display at bam.iobio". You will be taken directly to bam.iobio and analysis will start automatically. As a bonus this link is also shareable.

<img src="/public/images/blog/galaxy_integration/bam.iobio_galaxy.png"  style="width: 300px; display:block; margin:20px auto"/>

The ExAC vcf file works the same way, however the index (.gz) has to be created first, which will take up to a few minutes the first time. However after it's created once, all future analyses will be instant just like for bam files.

<video  controls loop video controls autoplay style="width:100%; margin: 10px auto">
<source src="/public/images/blog/galaxy_integration/galaxy_vcf.iobio.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>