---
layout: post
title: Creating a compressed and indexed VCF
image: /public/images/blog/tabix.png
subtitle: The .vcf.gz and .vcf.gz.tbi file pair
tags:
  - Yi Qiao
---

Compressing VCF files with BGZip and indexing it with Tabix is the standard way VCF files are stored, and is the format that iobio apps support. The software to compress and index VCF files is called Tabix, developed by Heng Li at the Broad Institute. 

### For MacOS systems

We provide a simple Mac App for compressing and indexing vcf files using Tabix.

* Download the [iTabixIt App](http://vcf.iobio.io/tabix/iTabixit.zip).
* Double-click to decompress it.
* Download the [Tabix and Bgzip binaries](http://vcf.iobio.io/tabix/TabixBinary.zip).
* Double-click to decompress it in the same parent folder as the iTabixApp.
* Now you should see an icon for the iTabixApp and a folder for the binaries.

<div style="text-align:center">
	<img src="/public/images/blog/tabix1.png" style="width:20%"/>
</div>

* Now double-click on the iTabixIt icon to launch the app.
* Select a .vcf file.  The app will start processing to compress and index the .vcf file.

<div style="text-align:center">
	<img src="/public/images/blog/tabix2.png" style="width:50%"/>
</div>

* When the app is down compressing and indexing the VCF file, green dots will appear next to the completed items.

<div style="text-align:center">
	<img src="/public/images/blog/tabix3.png" style="width:50%"/>
</div>

* Now the .vcf.gz and .vcf.gz.tbi files will be created in the same directory as the .vcf file. Now you are ready to run vcf.iobio or gene.iobio, selecting these two files when prompted.



### For Linux-based system

*  Download the latest tabix jar at <http://sourceforge.net/projects/samtools/files/tabix/>.
* Install C compiler and the 'make' utility with the package management system of your specific Linux distribution. In the case of Ubuntu, the following command should suffice:

```
	$ sudo apt-get install build-essential
	$ tar -xjf tabix-0.2.6.tar.bz2
	$ cd tabix-0.2.6
	$ make
```

* Once you have successfully compiled Tabix (and bgzip), you can compress your vcf files with the following command:

```	
	$ /path/to/tabix/bgzip myvcf.vcf
	$ /path/to/tabix/tabix -p vcf myvcf.vcf.gz
```

* These two commands will create two new files: the compressed vcf (.vcf.gz) and the index (.vcf.gz.tbi). Now you are ready to run vcf.iobio or gene.iobio, selecting these two files when prompted.

The manual page for Tabix and BGZip can be found at <http://samtools.sourceforge.net/tabix.shtml>.

