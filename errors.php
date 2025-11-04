<?php 
if (isset($errors) && count($errors) > 0) : ?>
  <div class="error">
        <?php foreach ($errors as $error) : ?>
          <p><?php echo htmlspecialchars($error); ?></p>
        <?php endforeach ?>
  </div>
<?php endif ?>
