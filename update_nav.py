import os
import re

def update_navbar(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find the prefix used for relative links in this file based on eidiki-ekpaideysi link
                match = re.search(r'<a href="([^"]*)eidiki-ekpaideysi/index\.html"', content)
                if match:
                    prefix = match.group(1)
                else:
                    # In case it's in a slightly different format
                    match2 = re.search(r'<a href="([^"]*)taxeis/index\.html"', content)
                    prefix = match2.group(1) if match2 else ""

                if prefix is not None:
                    # Only inject if "Γλώσσα" is not already in the navbar
                    if '<li><a href="' + prefix + 'glossa/index.html">Γλώσσα</a></li>' not in content and '<li><a href="index.html" class="active">Γλώσσα</a></li>' not in content:
                        
                        # Find the list item for "Ειδική Εκπαίδευση" and insert before it
                        target_string_active = f'<li><a href="{prefix}eidiki-ekpaideysi/index.html" class="active">Ειδική Εκπαίδευση</a></li>'
                        target_string_inactive = f'<li><a href="{prefix}eidiki-ekpaideysi/index.html">Ειδική Εκπαίδευση</a></li>'
                        
                        insert_string = f'<li><a href="{prefix}glossa/index.html">Γλώσσα</a></li>\n        <li><a href="{prefix}mathimatika/index.html">Μαθηματικά</a></li>\n        '
                        
                        if target_string_inactive in content:
                            content = content.replace(target_string_inactive, insert_string + target_string_inactive)
                        elif target_string_active in content:
                            content = content.replace(target_string_active, insert_string + target_string_active)
                            
                        # Need to update footer links as well!
                        # Find footer links block
                        footer_target = f'<li><a href="{prefix}eidiki-ekpaideysi/index.html">Ειδική Εκπαίδευση</a></li>'
                        if footer_target in content:
                            # Might have replaced it in the header already, so just replace it literally again? No, replace replaces all occurrences
                            # But wait, replace replaces ALL occurrences.
                            pass

                # Let's write a targeted replace for footer
                # Wait, if we replace ALL occurrences of target_string_inactive, it updates header and footer at once. 
                # Let's run it.
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

update_navbar(r"C:\Users\Teacher\Desktop\learningfastsite")
print("Navbar updated in all HTML files.")
